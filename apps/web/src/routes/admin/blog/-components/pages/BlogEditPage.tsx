import type { BlogFormValues } from "@/features/admin-blog/hooks/use-blog-form";
import { useEditBlogPost } from "@/features/admin-blog/hooks/use-edit-blog-post";
import { BlogForm } from "../fragments/BlogForm";

type BlogEditPageProps = {
	id: number;
};

export const BlogEditPage = ({ id }: BlogEditPageProps) => {
	const { initialData, updatePost } = useEditBlogPost(id);

	const submit = (values: BlogFormValues) => {
		updatePost.mutate({
			id,
			title: values.title,
			content: values.content,
			excerpt: values.excerpt || undefined,
			coverImage: values.coverImage || undefined,
			tags: values.tags.length > 0 ? values.tags : undefined,
			published: values.published,
		});
	};

	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<BlogForm
				mode="edit"
				initialData={initialData}
				onSubmit={submit}
				isPending={updatePost.isPending}
				headingText="記事を編集"
				submitLabel="記事を更新"
				submitPendingLabel="更新中..."
			/>
		</main>
	);
};
