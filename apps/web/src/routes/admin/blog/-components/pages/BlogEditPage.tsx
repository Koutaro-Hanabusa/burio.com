import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { useAdminBlogPost } from "@/features/admin-blog/api/get-admin-blog-post";
import { useUpdateBlogPost } from "@/features/admin-blog/api/update-blog-post";
import type {
	BlogFormInitialData,
	BlogFormValues,
} from "@/features/admin-blog/hooks/use-blog-form";
import { stringifyTagsForm } from "@/features/blog/utils/parse-tags";
import { BlogForm } from "../fragments/BlogForm";

type BlogEditPageProps = {
	id: number;
};

export const BlogEditPage = ({ id }: BlogEditPageProps) => {
	const navigate = useNavigate();
	const post = useAdminBlogPost(id);

	const updatePost = useUpdateBlogPost({
		mutationConfig: {
			onSuccess: (data) => {
				toast.success("記事を更新しました");
				navigate({ to: `/blog/${data.id}` });
			},
			onError: (error) => {
				toast.error(`エラー: ${error.message}`);
			},
		},
	});

	const initialData = useMemo<BlogFormInitialData>(
		() => ({
			title: post.title,
			content: post.content || "",
			excerpt: post.excerpt || "",
			coverImage: post.coverImage || "",
			tags: stringifyTagsForm(post.tags),
			published: post.published === 1,
		}),
		[post],
	);

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
