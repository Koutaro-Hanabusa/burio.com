import { ContentLayout } from "@/components/layouts/ContentLayout";
import { BlogPosts } from "@/features/blog/components/BlogPosts";
import type { Props } from "./index.server";

export default function BlogIndex({ posts }: Props) {
	return (
		<ContentLayout>
			<BlogPosts posts={posts} />
		</ContentLayout>
	);
}
