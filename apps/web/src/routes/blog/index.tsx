import { createFileRoute } from "@tanstack/react-router";
import { getBlogPostsQueryOptions } from "@/features/blog/api/get-blog-posts";
import { BlogIndexError } from "./-components/fallbacks/BlogIndexError";
import { BlogIndexPending } from "./-components/fallbacks/BlogIndexPending";
import { BlogListPage } from "./-components/pages/BlogListPage";

export const Route = createFileRoute("/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getBlogPostsQueryOptions()),
	pendingComponent: BlogIndexPending,
	errorComponent: BlogIndexError,
	component: BlogListPage,
});
