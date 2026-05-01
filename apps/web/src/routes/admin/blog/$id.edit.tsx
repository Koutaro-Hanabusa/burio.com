import { createFileRoute, notFound } from "@tanstack/react-router";
import { getAdminBlogPostQueryOptions } from "@/features/admin-blog/api/get-admin-blog-post";
import { BlogEditError } from "./-components/fallbacks/BlogEditError";
import { BlogEditPending } from "./-components/fallbacks/BlogEditPending";
import { BlogNotFound } from "./-components/fallbacks/BlogNotFound";
import { BlogEditPage } from "./-components/pages/BlogEditPage";

const EditRoute = () => {
	const { id } = Route.useParams();
	return <BlogEditPage id={Number(id)} />;
};

export const Route = createFileRoute("/admin/blog/$id/edit")({
	loader: async ({ params, context }) => {
		const id = Number(params.id);
		try {
			return await context.queryClient.ensureQueryData(
				getAdminBlogPostQueryOptions(id),
			);
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
