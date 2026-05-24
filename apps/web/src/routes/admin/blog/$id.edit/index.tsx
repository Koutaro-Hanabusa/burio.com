import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getAdminBlogPostQueryOptions } from "@/features/blog/api/get-admin-blog-post";
import { AdminBlogEditError } from "./-components/fallbacks/AdminBlogEditError";
import { AdminBlogEditNotFound } from "./-components/fallbacks/AdminBlogEditNotFound";
import { AdminBlogEditPending } from "./-components/fallbacks/AdminBlogEditPending";
import { UpdateBlogPostPage } from "./-components/UpdateBlogPostPage";

const paramsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export const Route = createFileRoute("/admin/blog/$id/edit/")({
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
			if (error instanceof Error && /not found/i.test(error.message)) {
				throw notFound();
			}
			throw error;
		}
	},
	pendingComponent: AdminBlogEditPending,
	errorComponent: AdminBlogEditError,
	notFoundComponent: AdminBlogEditNotFound,
	component: UpdateBlogPostPage,
});
