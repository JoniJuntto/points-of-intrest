import { existsSync, readFileSync } from "node:fs";
import type { ConnectionOptions } from "pg";

const SSL_QUERY_PARAMS = [
	"sslmode",
	"sslrootcert",
	"sslcert",
	"sslkey",
	"uselibpqcompat",
] as const;

export function stripSslParams(connectionString: string) {
	const questionIndex = connectionString.indexOf("?");
	if (questionIndex === -1) return connectionString;

	const base = connectionString.slice(0, questionIndex);
	const params = new URLSearchParams(connectionString.slice(questionIndex + 1));

	for (const key of SSL_QUERY_PARAMS) {
		params.delete(key);
	}

	const remaining = params.toString();
	return remaining ? `${base}?${remaining}` : base;
}

export function getPgSslConfig(): ConnectionOptions["ssl"] | undefined {
	const caPath = process.env.DATABASE_SSL_CA ?? "/pg-ca.pem";
	if (!existsSync(caPath)) return undefined;

	return {
		ca: readFileSync(caPath, "utf8"),
		rejectUnauthorized: true,
	};
}
