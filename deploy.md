# Deploy to UpCloud

Deploys the **API** (`apps/server`, Elysia) and **Web** (`apps/web`, TanStack Start SSR)
to a shared UpCloud server via Docker, behind a reverse proxy with TLS.

- API → `https://poiapi.arvoitus.com`
- Web → `https://poi.arvoitus.com`
- DB → UpCloud Managed PostgreSQL (not containerized)
- Object storage → UpCloud Managed Object Storage (S3-compatible, not containerized)

The server shares the box with other services, so the two app containers bind to
**exotic host ports** and the reverse proxy fronts them on 80/443:

| Service | Container port | Host port |
|---------|---------------|-----------|
| API     | 3000          | `47321`   |
| Web     | 3001          | `47322`   |

> The API listens on a hardcoded `3000` and web on `PORT` (default `3001`) inside the
> container — only the host-side mapping is exotic, so no code changes needed.

---

## 1. Provision UpCloud managed services

**PostgreSQL** (UpCloud Console → Databases → PostgreSQL): create an instance in the
same zone as the server. Copy the connection URI. Restrict its firewall to the
server's private/public IP.

**Object Storage** (UpCloud Console → Object Storage): create an instance and a bucket
named `poigame`. Note the endpoint (e.g. `https://<name>.<zone>.upcloudobjects.com`),
region, access key, and secret key. Make objects readable if you serve images directly.

---

## 2. Point DNS at the server

Add two A records → the server's public IP:

```
poiapi.arvoitus.com  A  <server-ip>
poi.arvoitus.com     A  <server-ip>
```

---

## 3. Get the code onto the server

```bash
ssh root@<server-ip>
# Docker must be installed; if not:
#   curl -fsSL https://get.docker.com | sh
git clone <repo-url> /opt/poigame
cd /opt/poigame
```

---

## 4. Create env files

`apps/server/.env`:

```env
NODE_ENV=production
DATABASE_URL=postgres://<user>:<pass>@<db-host>:<db-port>/poigame?sslmode=verify-full&sslrootcert=/pg-ca.pem
BETTER_AUTH_SECRET=<random-32-chars>
BETTER_AUTH_URL=https://poiapi.arvoitus.com
CORS_ORIGIN=https://poi.arvoitus.com
S3_ENDPOINT=https://vi9f8.upcloudobjects.com
S3_REGION=EUROPE-1
S3_BUCKET=poigame
S3_ACCESS_KEY_ID=<access-key>
S3_SECRET_ACCESS_KEY=<secret-key>
```

> **Postgres TLS**: UpCloud managed Postgres presents a self-signed CA, and
> `node-postgres` verifies certs under `sslmode=require` — connections fail with
> `SELF_SIGNED_CERT_IN_CHAIN`. Save the CA on the server and pin it:
>
> ```bash
> openssl s_client -showcerts -starttls postgres -connect <db-host>:<db-port> </dev/null 2>/dev/null \
>   | awk '/BEGIN CERTIFICATE/,/END CERTIFICATE/' > /opt/poigame/pg-ca.pem
> ```
>
> `docker-compose.prod.yml` mounts `./pg-ca.pem` at `/pg-ca.pem` inside the server
> container. Use `sslmode=verify-full&sslrootcert=/pg-ca.pem` in `DATABASE_URL` as above.

Web has no runtime env — `VITE_SERVER_URL` is **baked at build time** (step 5).

---

## 5. Production compose file

Create `docker-compose.prod.yml` (only web + server; DB and storage are managed):

```yaml
name: poigame

services:
  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    init: true
    ports:
      - "127.0.0.1:47321:3000"
    env_file:
      - apps/server/.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      args:
        VITE_SERVER_URL: https://poiapi.arvoitus.com
    init: true
    ports:
      - "127.0.0.1:47322:3001"
    restart: unless-stopped
    depends_on:
      server:
        condition: service_healthy
```

> Ports bind to `127.0.0.1` so they're reachable only by the local reverse proxy, never
> exposed publicly. If your proxy runs in Docker on a shared network, drop the
> `127.0.0.1:` prefix and put both on that network instead.

Build and start:

```bash
cd /opt/poigame
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 6. Run DB migrations

Schema lives in `@poigame/db`. Push it against the managed DB (one-off):

```bash
docker compose -f docker-compose.prod.yml run --rm \
  -v ./pg-ca.pem:/pg-ca.pem:ro \
  -e DATABASE_URL="postgresql://<user>:<pass>@<host>:<port>/<db>?sslmode=verify-full&sslrootcert=/pg-ca.pem" \
  server sh -c "cd /app && bun run db:migrate"
```

(Use `db:push` instead of `db:migrate` if you prefer schema-push over generated migrations.)

---

## 7. Reverse proxy + TLS

### If the server has no proxy yet — Caddy (auto HTTPS)

```bash
docker run -d --name caddy --restart unless-stopped \
  --network host \
  -v /opt/poigame/Caddyfile:/etc/caddy/Caddyfile \
  -v caddy_data:/data -v caddy_config:/config \
  caddy:latest
```

`/opt/poigame/Caddyfile`:

```
poiapi.arvoitus.com {
    reverse_proxy 127.0.0.1:47321
}

poi.arvoitus.com {
    reverse_proxy 127.0.0.1:47322
}
```

Caddy fetches Let's Encrypt certs automatically. Reload after edits:
`docker exec caddy caddy reload --config /etc/caddy/Caddyfile`.

### If nginx already fronts 80/443 on this box

Add two server blocks (certs via `certbot --nginx -d poiapi.arvoitus.com -d poi.arvoitus.com`):

```nginx
server {
    server_name poiapi.arvoitus.com;
    location / { proxy_pass http://127.0.0.1:47321; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
}
server {
    server_name poi.arvoitus.com;
    location / { proxy_pass http://127.0.0.1:47322; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
}
```

---

## 8. Verify

```bash
curl -I https://poiapi.arvoitus.com        # API root, expect 200
curl -I https://poi.arvoitus.com           # web, expect 200
docker compose -f docker-compose.prod.yml logs -f
```

---

## Redeploy

```bash
cd /opt/poigame && git pull
docker compose -f docker-compose.prod.yml up -d --build
# run step 6 again only if the DB schema changed
```

---

## Notes

- **Change `VITE_SERVER_URL`?** Rebuild web (`--build`) — it's compiled in, not runtime.
- **Port clash** with another service? Pick any other free high port and update both the
  compose mapping and the proxy target.
- **Native app** (`apps/native`) isn't deployed here — point its `EXPO_PUBLIC_SERVER_URL`
  at `https://poiapi.arvoitus.com` and ship via EAS.
