import { createFileRoute } from "@tanstack/react-router";
import { CreateBlogPostPage } from "./-components/CreateBlogPostPage";

export const Route = createFileRoute("/admin/blog/new/")({
	component: CreateBlogPostPage,
});
