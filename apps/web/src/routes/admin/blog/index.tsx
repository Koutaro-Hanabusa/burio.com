import { createFileRoute } from "@tanstack/react-router";
import { getAdminBlogPostsQueryOptions } from "@/features/blog/api/get-admin-blog-posts";
import { AdminBlogListError } from "@/features/blog/components/fallbacks/AdminBlogListError";
import { AdminBlogListPending } from "@/features/blog/components/fallbacks/AdminBlogListPending";
import { AdminBlogListPage } from "./-components/AdminBlogListPage";

export const Route = createFileRoute("/admin/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getAdminBlogPostsQueryOptions()),
	pendingComponent: AdminBlogListPending,
	errorComponent: AdminBlogListError,
	component: AdminBlogListPage,
});
