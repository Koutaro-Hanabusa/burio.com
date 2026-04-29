import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogFormInitialData } from "@/features/admin-blog/hooks/use-blog-form";
import { stringifyTagsForm } from "@/features/blog/utils/parse-tags";
import { trpc } from "@/utils/trpc";
import { BlogForm } from "./-components/BlogForm";

export const Route = createFileRoute("/admin/blog/$id/edit")({
	component: EditBlogPost,
});

function EditBlogPost() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	// 既存記事データを取得（R2のコンテンツも含む）
	const { data: post, isLoading } = trpc.blog.getById.useQuery({
		id: Number(id),
	});

	const updatePost = trpc.blog.update.useMutation({
		onSuccess: (data) => {
			toast.success("記事を更新しました");
			navigate({ to: `/blog/${data.id}` });
		},
		onError: (error) => {
			toast.error(`エラー: ${error.message}`);
		},
	});

	const initialData = useMemo<BlogFormInitialData | undefined>(() => {
		if (!post) return undefined;
		return {
			title: post.title,
			content: post.content || "",
			excerpt: post.excerpt || "",
			coverImage: post.coverImage || "",
			tags: stringifyTagsForm(post.tags),
			published: post.published === 1,
		};
	}, [post]);

	if (isLoading) {
		return (
			<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
				<div className="mx-auto max-w-4xl space-y-6">
					<Skeleton className="h-10 w-64" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-10 w-32" />
				</div>
			</main>
		);
	}

	if (!post) {
		return (
			<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="mb-4 font-bold text-3xl">記事が見つかりません</h1>
					<Button onClick={() => navigate({ to: "/admin/blog" })}>
						管理画面に戻る
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<BlogForm
				mode="edit"
				initialData={initialData}
				onSubmit={(values) => {
					updatePost.mutate({
						id: Number(id),
						title: values.title,
						content: values.content,
						excerpt: values.excerpt || undefined,
						coverImage: values.coverImage || undefined,
						tags: values.tags.length > 0 ? values.tags : undefined,
						published: values.published,
					});
				}}
				isPending={updatePost.isPending}
				headingText="記事を編集"
				submitLabel="記事を更新"
				submitPendingLabel="更新中..."
			/>
		</main>
	);
}
