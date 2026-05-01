import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBlogPostQueryOptions } from "@/features/blog/api/get-blog-post";
import { BlogPostError } from "./-components/fallbacks/BlogPostError";
import { BlogPostNotFound } from "./-components/fallbacks/BlogPostNotFound";
import { BlogPostPending } from "./-components/fallbacks/BlogPostPending";
import { BlogPostPage } from "./-components/pages/BlogPostPage";

const PostRoute = () => {
	const { id } = Route.useParams();
	return <BlogPostPage id={Number(id)} />;
};

export const Route = createFileRoute("/blog/$id")({
	loader: async ({ params, context }) => {
		const id = Number(params.id);
		try {
			return await context.queryClient.ensureQueryData(
				getBlogPostQueryOptions(id),
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
	component: PostRoute,
});
