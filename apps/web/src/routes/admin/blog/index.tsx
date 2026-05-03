import { createFileRoute } from "@tanstack/react-router";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { getAdminBlogPostsQueryOptions } from "@/features/blog/api/get-admin-blog-posts";
import { AdminBlogList } from "@/features/blog/components/AdminBlogList";
import { AdminBlogListError } from "@/features/blog/components/fallbacks/AdminBlogListError";
import { AdminBlogListPending } from "@/features/blog/components/fallbacks/AdminBlogListPending";

const AdminBlogListRoute = () => (
	<ContentLayout>
		<AdminBlogList />
	</ContentLayout>
);

export const Route = createFileRoute("/admin/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getAdminBlogPostsQueryOptions()),
	pendingComponent: AdminBlogListPending,
	errorComponent: AdminBlogListError,
	component: AdminBlogListRoute,
});
