import { createFileRoute } from "@tanstack/react-router";
import { getAdminBlogPostsQueryOptions } from "@/features/blog/api/get-admin-blog-posts";
import { AdminBlogListError } from "./-components/AdminBlogListError";
import { AdminBlogListPage } from "./-components/AdminBlogListPage";
import { AdminBlogListPending } from "./-components/AdminBlogListPending";

export const Route = createFileRoute("/admin/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getAdminBlogPostsQueryOptions()),
	pendingComponent: AdminBlogListPending,
	errorComponent: AdminBlogListError,
	component: AdminBlogListPage,
});
