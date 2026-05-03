import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { getAdminBlogPostQueryOptions } from "@/features/blog/api/get-admin-blog-post";
import { AdminBlogEditError } from "@/features/blog/components/fallbacks/AdminBlogEditError";
import { AdminBlogEditNotFound } from "@/features/blog/components/fallbacks/AdminBlogEditNotFound";
import { AdminBlogEditPending } from "@/features/blog/components/fallbacks/AdminBlogEditPending";
import { UpdateBlogPost } from "@/features/blog/components/UpdateBlogPost";

const paramsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

const UpdateBlogPostRoute = () => {
	const { id } = Route.useParams();
	return (
		<ContentLayout>
			<UpdateBlogPost id={id} />
		</ContentLayout>
	);
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
			if (error instanceof Error && /not found/i.test(error.message)) {
				throw notFound();
			}
			throw error;
		}
	},
	pendingComponent: AdminBlogEditPending,
	errorComponent: AdminBlogEditError,
	notFoundComponent: AdminBlogEditNotFound,
	component: UpdateBlogPostRoute,
});
