import { getRouteApi } from "@tanstack/react-router";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { BlogPostView } from "@/features/blog/components/BlogPostView";

const route = getRouteApi("/blog/$id/");

export const BlogPostPage = () => {
	const post = route.useLoaderData();
	return (
		<ContentLayout>
			<BlogPostView post={post} />
		</ContentLayout>
	);
};
