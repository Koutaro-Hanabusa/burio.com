import { createFileRoute } from "@tanstack/react-router";
import { getAdminBlogPostsQueryOptions } from "@/features/blog/api/get-admin-blog-posts";
import { AdminBlogListPage } from "./-components/AdminBlogListPage";
import { AdminBlogListError } from "./-components/fallbacks/AdminBlogListError";
import { AdminBlogListPending } from "./-components/fallbacks/AdminBlogListPending";

export const Route = createFileRoute("/admin/blog/")({
	ssr: false,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getAdminBlogPostsQueryOptions()),
	pendingComponent: AdminBlogListPending,
	errorComponent: AdminBlogListError,
	component: AdminBlogListPage,
});
