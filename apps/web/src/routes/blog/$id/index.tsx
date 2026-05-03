import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getBlogPostQueryOptions } from "@/features/blog/api/get-blog-post";
import { BlogPostError } from "./-components/BlogPostError";
import { BlogPostNotFound } from "./-components/BlogPostNotFound";
import { BlogPostPage } from "./-components/BlogPostPage";
import { BlogPostPending } from "./-components/BlogPostPending";

const paramsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export const Route = createFileRoute("/blog/$id/")({
	params: {
		parse: paramsSchema.parse,
		stringify: ({ id }) => ({ id: String(id) }),
	},
	loader: async ({ params, context }) => {
		try {
			return await context.queryClient.ensureQueryData(
				getBlogPostQueryOptions(params.id),
			);
		} catch (error) {
			if (error instanceof Error && /not found/i.test(error.message)) {
				throw notFound();
			}
			throw error;
		}
	},
	pendingComponent: BlogPostPending,
	errorComponent: BlogPostError,
	notFoundComponent: BlogPostNotFound,
	component: BlogPostPage,
});
