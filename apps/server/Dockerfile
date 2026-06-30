FROM node:24-slim AS base
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
RUN apt-get update \
	&& apt-get install -y --no-install-recommends libvips42 \
	&& rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV SKIP_ENV_VALIDATION=1

COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install \
	&& cd apps/server && bun install sharp --os=linux --cpu=arm64

ENV NODE_ENV=production
RUN cd apps/server && bun run build
ENV SKIP_ENV_VALIDATION=

EXPOSE 3000

WORKDIR /app/apps/server
CMD ["bun", "dist/index.mjs"]
