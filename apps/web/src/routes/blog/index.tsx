import { createFileRoute } from "@tanstack/react-router";
import { getBlogPostsQueryOptions } from "@/features/blog/api/get-blog-posts";
import { BlogPostsPage } from "./-components/BlogPostsPage";
import { BlogListError } from "./-components/fallbacks/BlogListError";
import { BlogListPending } from "./-components/fallbacks/BlogListPending";

export const Route = createFileRoute("/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getBlogPostsQueryOptions()),
	pendingComponent: BlogListPending,
	errorComponent: BlogListError,
	component: BlogPostsPage,
});
