import { cors } from "@elysiajs/cors";
import { createContext } from "@poigame/api/context";
import { agentDebugLog } from "@poigame/api/debug-agent-log";
import { appRouter } from "@poigame/api/routers/index";
import { getPlacePhotoForUser } from "@poigame/api/services/photo-storage";
import { auth } from "@poigame/auth";
import { env } from "@poigame/env/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Elysia } from "elysia";
import { initLogger } from "evlog";
import {
	type BetterAuthInstance,
	createAuthMiddleware,
} from "evlog/better-auth";
import { evlog } from "evlog/elysia";

initLogger({
	env: { service: "poigame-server" },
});

const identifyUser = createAuthMiddleware(auth as BetterAuthInstance, {
	exclude: ["/api/auth/**"],
	maskEmail: true,
});

new Elysia()
	.use(evlog())
	.derive(async ({ request, log }) => {
		await identifyUser(log, request.headers, new URL(request.url).pathname);
		return {};
	})
	.use(
		cors({
			origin: env.CORS_ORIGIN,
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.all("/api/auth/*", async (context) => {
		const { request, status } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		return status(405);
	})
	.get("/api/photos/places/:placeId", async ({ params, request, status }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) return status(401);
		const photo = await getPlacePhotoForUser(session.user.id, params.placeId);
		if (!photo) return status(404);
		return new Response(photo, {
			headers: {
				"Cache-Control": "private, max-age=300",
				"Content-Type": "image/jpeg",
			},
		});
	})
	.all("/trpc/*", async (context) => {
		const res = await fetchRequestHandler({
			endpoint: "/trpc",
			router: appRouter,
			req: context.request,
			createContext: () => createContext({ context }),
		});
		return res;
	})
	.post("/api/debug-log", async ({ request }) => {
		try {
			const body = (await request.json()) as Record<string, unknown>;
			agentDebugLog(body);
			return { ok: true };
		} catch {
			return { ok: false };
		}
	})
	.get("/", () => "OK")
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
