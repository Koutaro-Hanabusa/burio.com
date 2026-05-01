import { trpc } from "@/utils/trpc";
import { PUBLIC_BLOG_LIST_INPUT } from "../constants/queries";

/**
 * 公開ブログ一覧を Suspense 経由で取得するフック。
 * loader でプリフェッチ済みのキャッシュをそのまま再利用する。
 */
export const useBlogPosts = () => {
	const [data] = trpc.blog.getAll.useSuspenseQuery(PUBLIC_BLOG_LIST_INPUT);
	return data;
};
