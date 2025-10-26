import { publicProcedure, router } from "../lib/trpc";
import { adminRouter } from "./admin";
import { blogRouter } from "./blog";
import { ogpRouter } from "./ogp";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	blog: blogRouter,
	admin: adminRouter,
	ogp: ogpRouter,
});
export type AppRouter = typeof appRouter;
