import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

/**
 * 新規ブログ記事作成フォーム用フック。
 * 作成成功時に作成された記事の詳細ページへ遷移する。
 */
export const useCreateBlogPost = () => {
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

	return createPost;
};
