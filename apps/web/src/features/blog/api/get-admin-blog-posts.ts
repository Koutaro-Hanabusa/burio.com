import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

/**
 * 管理側ブログ一覧の useSuspenseQuery / loader で共通利用する input。
 * 公開状態に関わらず全件取得する。
 */
export const ADMIN_BLOG_LIST_INPUT = { limit: 100 } as const;

/**
 * 管理画面ブログ一覧を取得する純関数。
 */
export const getAdminBlogPosts = () =>
	trpcClient.blog.getAll.query(ADMIN_BLOG_LIST_INPUT);

/**
 * 管理画面ブログ一覧の queryOptions factory。
 * loader と hook の双方から参照する単一ソース。
 */
export const getAdminBlogPostsQueryOptions = () =>
	queryOptions({
		queryKey: getQueryKey(trpc.blog.getAll, ADMIN_BLOG_LIST_INPUT, "query"),
		queryFn: getAdminBlogPosts,
	});

/**
 * 管理画面ブログ一覧を Suspense 経由で取得するフック。
 */
export const useAdminBlogPosts = () => {
	const { data } = useSuspenseQuery(getAdminBlogPostsQueryOptions());
	return data;
};
