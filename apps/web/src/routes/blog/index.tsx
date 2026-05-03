import { createFileRoute } from "@tanstack/react-router";
import { getBlogPostsQueryOptions } from "@/features/blog/api/get-blog-posts";
import { BlogIndexError } from "./-components/BlogIndexError";
import { BlogIndexPending } from "./-components/BlogIndexPending";
import { BlogListPage } from "./-components/BlogListPage";

export const Route = createFileRoute("/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getBlogPostsQueryOptions()),
	pendingComponent: BlogIndexPending,
	errorComponent: BlogIndexError,
	component: BlogListPage,
});
