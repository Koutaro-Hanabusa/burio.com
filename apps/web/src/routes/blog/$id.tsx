import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { getBlogPostQueryOptions } from "@/features/blog/api/get-blog-post";
import { BlogPostView } from "@/features/blog/components/BlogPostView";
import { BlogPostError } from "@/features/blog/components/fallbacks/BlogPostError";
import { BlogPostNotFound } from "@/features/blog/components/fallbacks/BlogPostNotFound";
import { BlogPostPending } from "@/features/blog/components/fallbacks/BlogPostPending";

const paramsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

const BlogPostViewRoute = () => {
	const { id } = Route.useParams();
	return (
		<ContentLayout>
			<BlogPostView id={id} />
		</ContentLayout>
	);
};

export const Route = createFileRoute("/blog/$id")({
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
	component: BlogPostViewRoute,
});
