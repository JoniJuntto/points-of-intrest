import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

import { getPgSslConfig, stripSslParams } from "./src/pg-connection";

dotenv.config({
	path: "../../apps/server/.env",
});

function getMigrateDatabaseUrl() {
	const url =
		process.env.MIGRATE_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

	// Docker Compose uses the `db` service name, which only resolves inside the network.
	if (url.includes("@db:")) {
		return url.replace("@db:", "@localhost:");
	}

	return url;
}

function getDbCredentials() {
	const url = stripSslParams(getMigrateDatabaseUrl());
	const ssl = getPgSslConfig();

	if (ssl) {
		return { url, ssl };
	}

	return { url };
}

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: getDbCredentials(),
});
