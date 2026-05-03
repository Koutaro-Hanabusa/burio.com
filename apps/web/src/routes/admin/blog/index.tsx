import { createFileRoute } from "@tanstack/react-router";
import { getAdminBlogPostsQueryOptions } from "@/features/blog/api/get-admin-blog-posts";
import { AdminBlogList } from "@/features/blog/components/admin-blog-list";
import { BlogListError } from "./-components/fallbacks/BlogListError";
import { BlogListPending } from "./-components/fallbacks/BlogListPending";

const BlogAdmin = () => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<AdminBlogList />
		</main>
	);
};

export const Route = createFileRoute("/admin/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getAdminBlogPostsQueryOptions()),
	pendingComponent: BlogListPending,
	errorComponent: BlogListError,
	component: BlogAdmin,
});
