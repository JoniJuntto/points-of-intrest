import { expo } from "@better-auth/expo";
import { createDb } from "@poigame/db";
import * as schema from "@poigame/db/schema/auth";
import { env } from "@poigame/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";

import { migrateAnonymousUser } from "./migrate-anonymous-user";

export function createAuth() {
	const db = createDb();

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",

			schema: schema,
		}),
		trustedOrigins: [
			env.CORS_ORIGIN,
			"poigame://",
			"exp://",
			"http://localhost:8081",
		],
		emailAndPassword: {
			enabled: true,
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
				httpOnly: true,
			},
		},
		plugins: [
			expo(),
			anonymous({
				onLinkAccount: async ({ anonymousUser, newUser }) => {
					await migrateAnonymousUser(anonymousUser.user.id, newUser.user.id);
				},
			}),
		],
	});
}

export const auth = createAuth();
