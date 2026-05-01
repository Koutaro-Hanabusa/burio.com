import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { toast } from "sonner";
import { ADMIN_BLOG_LIST_INPUT } from "@/features/blog/constants/queries";
import { trpc } from "@/utils/trpc";

/**
 * 管理画面ブログ一覧で必要となる Suspense クエリと、
 * 削除 / 公開状態切替の各 mutation をまとめたフック。
 *
 * 成功時には `blog.getAll` 配下のキャッシュをまとめて invalidate し、
 * 公開側 / 管理側どちらの一覧も最新状態に追従させる。
 */
export const useAdminBlogList = () => {
	const queryClient = useQueryClient();
	const [posts] = trpc.blog.getAll.useSuspenseQuery(ADMIN_BLOG_LIST_INPUT);

	const invalidateBlogList = () => {
		queryClient.invalidateQueries({
			queryKey: getQueryKey(trpc.blog.getAll),
		});
	};

	const deletePost = trpc.blog.delete.useMutation({
		onSuccess: () => {
			toast.success("記事を削除しました");
			invalidateBlogList();
		},
		onError: (error) => {
			toast.error(`エラー: ${error.message}`);
		},
	});

	const togglePublish = trpc.blog.update.useMutation({
		onSuccess: () => {
			toast.success("公開状態を更新しました");
			invalidateBlogList();
		},
		onError: (error) => {
			toast.error(`エラー: ${error.message}`);
		},
	});

	const handleDelete = (id: number, title: string) => {
		if (confirm(`「${title}」を削除してよろしいですか？`)) {
			deletePost.mutate({ id });
		}
	};

	const handleTogglePublish = (id: number, currentStatus: boolean) => {
		togglePublish.mutate({
			id,
			published: !currentStatus,
		});
	};

	return {
		posts,
		handleDelete,
		handleTogglePublish,
	};
};
