import { createFileRoute } from "@tanstack/react-router";
import { getBlogPostsQueryOptions } from "@/features/blog/api/get-blog-posts";
import { BlogListError } from "./-components/BlogListError";
import { BlogListPending } from "./-components/BlogListPending";
import { BlogPostsPage } from "./-components/BlogPostsPage";

export const Route = createFileRoute("/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getBlogPostsQueryOptions()),
	pendingComponent: BlogListPending,
	errorComponent: BlogListError,
	component: BlogPostsPage,
});
