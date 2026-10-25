import { ContentLayout } from "@/components/layouts/ContentLayout";
import { AdminBlogForm } from "@/features/blog/components/AdminBlogForm";
import { stringifyTagsForm } from "@/features/blog/utils/parse-tags";
import type { Props } from "./edit.server";

export default function EditBlogPage({ post }: Props) {
	return (
		<ContentLayout>
			<AdminBlogForm
				mode="edit"
				id={post.id}
				headingText="記事を編集"
				initialData={{
					title: post.title,
					content: post.content || "",
					excerpt: post.excerpt || "",
					coverImage: post.coverImage || "",
					tags: stringifyTagsForm(post.tags),
					published: post.published === 1,
				}}
			/>
		</ContentLayout>
	);
}
