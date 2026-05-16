import { getRouteApi } from "@tanstack/react-router";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { BlogPosts } from "@/features/blog/components/BlogPosts";

const route = getRouteApi("/blog/");

export const BlogPostsPage = () => {
	const posts = route.useLoaderData();
	return (
		<ContentLayout>
			<BlogPosts posts={posts} />
		</ContentLayout>
	);
};
