import { env } from "@poigame/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getPgSslConfig, stripSslParams } from "./pg-connection";
import * as schema from "./schema";

export function createDb() {
	const ssl = getPgSslConfig();
	if (ssl) {
		const pool = new Pool({
			connectionString: stripSslParams(env.DATABASE_URL),
			ssl,
		});
		return drizzle({ client: pool, schema });
	}

	return drizzle(env.DATABASE_URL, { schema });
}

export const db = createDb();
