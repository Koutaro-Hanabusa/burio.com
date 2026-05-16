import { createFileRoute } from "@tanstack/react-router";
import { getBlogPosts } from "@/features/blog/api/get-blog-posts";
import { BlogPostsPage } from "./-components/BlogPostsPage";
import { BlogListError } from "./-components/fallbacks/BlogListError";
import { BlogListPending } from "./-components/fallbacks/BlogListPending";

export const Route = createFileRoute("/blog/")({
	ssr: true,
	loader: () => getBlogPosts(),
	pendingComponent: BlogListPending,
	errorComponent: BlogListError,
	component: BlogPostsPage,
});
