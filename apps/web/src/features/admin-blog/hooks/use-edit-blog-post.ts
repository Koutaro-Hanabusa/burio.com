import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import type { BlogFormInitialData } from "@/features/admin-blog/hooks/use-blog-form";
import { stringifyTagsForm } from "@/features/blog/utils/parse-tags";
import { trpc } from "@/utils/trpc";

/**
 * ブログ記事編集フォーム用フック。
 * 既存記事を Suspense で取得し、フォーム初期値と更新 mutation をまとめて返す。
 */
export const useEditBlogPost = (id: number) => {
	const navigate = useNavigate();

	const [post] = trpc.blog.getById.useSuspenseQuery({ id });

	const updatePost = trpc.blog.update.useMutation({
		onSuccess: (data) => {
			toast.success("記事を更新しました");
			navigate({ to: `/blog/${data.id}` });
		},
		onError: (error) => {
			toast.error(`エラー: ${error.message}`);
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

	return { post, initialData, updatePost };
};
