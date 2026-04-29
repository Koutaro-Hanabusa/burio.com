import { createFileRoute } from "@tanstack/react-router";
import { BlogNewPage } from "./-components/BlogNewPage";

export const Route = createFileRoute("/admin/blog/new")({
	component: BlogNewPage,
});
