import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getAdminBlogPostQueryOptions } from "@/features/admin-blog/api/get-admin-blog-post";
import { BlogEditError } from "./-components/fallbacks/BlogEditError";
import { BlogEditPending } from "./-components/fallbacks/BlogEditPending";
import { BlogNotFound } from "./-components/fallbacks/BlogNotFound";
import { BlogEditPage } from "./-components/pages/BlogEditPage";

const paramsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

const EditRoute = () => {
	const { id } = Route.useParams();
	return <BlogEditPage id={id} />;
};

export const Route = createFileRoute("/admin/blog/$id/edit")({
	params: {
		parse: paramsSchema.parse,
		stringify: ({ id }) => ({ id: String(id) }),
	},
	loader: async ({ params, context }) => {
		try {
			return await context.queryClient.ensureQueryData(
				getAdminBlogPostQueryOptions(params.id),
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
