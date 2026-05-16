import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { useAdminBlogPost } from "@/features/blog/api/get-admin-blog-post";
import { useUpdateBlogPost } from "@/features/blog/api/update-blog-post";
import { AdminBlogForm } from "@/features/blog/components/AdminBlogForm";
import type {
	BlogFormInitialData,
	BlogFormValues,
} from "@/features/blog/hooks/use-blog-form";
import { stringifyTagsForm } from "@/features/blog/utils/parse-tags";

const route = getRouteApi("/admin/blog/$id/edit/");

export const UpdateBlogPostPage = () => {
	const { id } = route.useParams();
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
		<ContentLayout>
			<AdminBlogForm
				mode="edit"
				initialData={initialData}
				onSubmit={submit}
				isPending={updatePost.isPending}
				headingText="記事を編集"
				submitLabel="記事を更新"
				submitPendingLabel="更新中..."
			/>
		</ContentLayout>
	);
};
