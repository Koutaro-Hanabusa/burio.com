import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { BlogForm } from "./BlogForm";

export const BlogNewPage = () => {
	const navigate = useNavigate();

	const createPost = trpc.blog.create.useMutation({
		onSuccess: (data) => {
			toast.success("記事を作成しました");
			navigate({ to: `/blog/${data.id}` });
		},
		onError: (error) => {
			toast.error(`エラー: ${error.message}`);
		},
	});

	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<BlogForm
				mode="new"
				onSubmit={(values) => {
					createPost.mutate({
						title: values.title,
						content: values.content,
						excerpt: values.excerpt,
						coverImage: values.coverImage || undefined,
						tags: values.tags.length > 0 ? values.tags : undefined,
						published: values.published,
					});
				}}
				isPending={createPost.isPending}
				headingText="新しい記事を作成"
				submitLabel="記事を作成"
				submitPendingLabel="保存中..."
			/>
		</main>
	);
};
