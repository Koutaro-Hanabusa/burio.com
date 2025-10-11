import { publicProcedure, router } from "../lib/trpc";
import { blogRouter } from "./blog";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	blog: blogRouter,
});
export type AppRouter = typeof appRouter;
