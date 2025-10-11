import { publicProcedure, router } from "../lib/trpc";
import { adminRouter } from "./admin";
import { blogRouter } from "./blog";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	blog: blogRouter,
	admin: adminRouter,
});
export type AppRouter = typeof appRouter;
