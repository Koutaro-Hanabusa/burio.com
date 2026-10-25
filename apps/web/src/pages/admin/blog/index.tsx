import { ContentLayout } from "@/components/layouts/ContentLayout";
import { AdminBlogList } from "@/features/blog/components/AdminBlogList";
import type { Props } from "./index.server";

export default function AdminBlogIndex({ posts }: Props) {
	return (
		<ContentLayout>
			<AdminBlogList posts={posts} />
		</ContentLayout>
	);
}
