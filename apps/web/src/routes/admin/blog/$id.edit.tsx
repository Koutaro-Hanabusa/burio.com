import { createFileRoute, notFound } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";
import { BlogEditError } from "./-components/BlogEditError";
import { BlogEditPage } from "./-components/BlogEditPage";
import { BlogEditPending } from "./-components/BlogEditPending";
import { BlogNotFound } from "./-components/BlogNotFound";

const EditRoute = () => {
	const { id } = Route.useParams();
	return <BlogEditPage id={Number(id)} />;
};

export const Route = createFileRoute("/admin/blog/$id/edit")({
	loader: async ({ params, context }) => {
		const id = Number(params.id);
		try {
			return await context.queryClient.ensureQueryData({
				queryKey: getQueryKey(trpc.blog.getById, { id }, "query"),
				queryFn: () => trpcClient.blog.getById.query({ id }),
			});
		} catch (error) {
			// サーバ側で記事未発見時は "Post not found" を throw する
			if (error instanceof Error && /not found/i.test(error.message)) {
				throw notFound();
			}
			throw error;
		}
	},
	pendingComponent: BlogEditPending,
	errorComponent: BlogEditError,
	notFoundComponent: BlogNotFound,
	component: EditRoute,
});
