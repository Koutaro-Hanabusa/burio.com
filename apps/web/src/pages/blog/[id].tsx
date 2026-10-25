import { ContentLayout } from "@/components/layouts/ContentLayout";
import { BlogPostView } from "@/features/blog/components/BlogPostView";
import type { Props } from "./[id].server";

export default function BlogPostPage({ post }: Props) {
	return (
		<ContentLayout>
			<BlogPostView post={post} />
		</ContentLayout>
	);
}
