import { createFileRoute } from "@tanstack/react-router";
import { getAdminBlogPostsQueryOptions } from "@/features/blog/api/get-admin-blog-posts";
import { BlogListError } from "./-components/fallbacks/BlogListError";
import { BlogListPending } from "./-components/fallbacks/BlogListPending";
import { BlogList } from "./-components/fragments/BlogList";

const BlogAdmin = () => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<BlogList />
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
