import { protectedProcedure, publicProcedure, router } from "../index";
import { placesRouter } from "./places";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	places: placesRouter,
});
export type AppRouter = typeof appRouter;
