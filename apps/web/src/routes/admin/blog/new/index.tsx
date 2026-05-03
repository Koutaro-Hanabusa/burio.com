import { createFileRoute } from "@tanstack/react-router";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { CreateBlogPost } from "./-components/CreateBlogPost";

const CreateBlogPostRoute = () => (
	<ContentLayout>
		<CreateBlogPost />
	</ContentLayout>
);

export const Route = createFileRoute("/admin/blog/new/")({
	component: CreateBlogPostRoute,
});
