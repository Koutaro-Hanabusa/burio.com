import { createFileRoute } from "@tanstack/react-router";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { getBlogPostsQueryOptions } from "@/features/blog/api/get-blog-posts";
import { BlogPosts } from "@/features/blog/components/BlogPosts";
import { BlogListError } from "@/features/blog/components/fallbacks/BlogListError";
import { BlogListPending } from "@/features/blog/components/fallbacks/BlogListPending";

const BlogPostsRoute = () => (
	<ContentLayout>
		<BlogPosts />
	</ContentLayout>
);

export const Route = createFileRoute("/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getBlogPostsQueryOptions()),
	pendingComponent: BlogListPending,
	errorComponent: BlogListError,
	component: BlogPostsRoute,
});
