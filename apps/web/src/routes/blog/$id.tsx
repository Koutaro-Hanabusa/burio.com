import { createFileRoute, notFound } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";
import { BlogPostError } from "./-components/BlogPostError";
import { BlogPostNotFound } from "./-components/BlogPostNotFound";
import { BlogPostPage } from "./-components/BlogPostPage";
import { BlogPostPending } from "./-components/BlogPostPending";

const PostRoute = () => {
	const { id } = Route.useParams();
	return <BlogPostPage id={Number(id)} />;
};

export const Route = createFileRoute("/blog/$id")({
	loader: async ({ params, context }) => {
		const id = Number(params.id);
		try {
			return await context.queryClient.ensureQueryData({
				queryKey: getQueryKey(trpc.blog.getById, { id }, "query"),
				queryFn: () => trpcClient.blog.getById.query({ id }),
			});
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
