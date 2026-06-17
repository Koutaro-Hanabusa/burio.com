import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { useCreateBlogPost } from "@/features/blog/api/create-blog-post";
import { AdminBlogForm } from "@/features/blog/components/AdminBlogForm";
import type { BlogFormValues } from "@/features/blog/hooks/use-blog-form";

export const CreateBlogPostPage = () => {
	const navigate = useNavigate();

	const createPost = useCreateBlogPost({
		mutationConfig: {
			onSuccess: (data) => {
				toast.success("記事を作成しました");
				void navigate({ to: `/blog/${data.id}` });
			},
			onError: (error) => {
				toast.error(`エラー: ${error.message}`);
			},
		},
	});

	const submit = (values: BlogFormValues) => {
		createPost.mutate({
			title: values.title,
			content: values.content,
			excerpt: values.excerpt,
			coverImage: values.coverImage || undefined,
			tags: values.tags.length > 0 ? values.tags : undefined,
			published: values.published,
		});
	};

	return (
		<ContentLayout>
			<AdminBlogForm
				mode="new"
				onSubmit={submit}
				isPending={createPost.isPending}
				headingText="新しい記事を作成"
				submitLabel="記事を作成"
				submitPendingLabel="保存中..."
			/>
		</ContentLayout>
	);
};
