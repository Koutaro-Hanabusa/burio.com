import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

/**
 * 公開側ブログ一覧の useSuspenseQuery / loader で共通利用する input。
 * クエリキーを揃えるため必ずこの定数を経由すること。
 */
export const PUBLIC_BLOG_LIST_INPUT = { limit: 50, published: true } as const;

/**
 * 公開ブログ一覧を取得する純関数。
 * tRPC クライアント経由で `blog.getAll` を呼び出す。
 */
export const getBlogPosts = () =>
	trpcClient.blog.getAll.query(PUBLIC_BLOG_LIST_INPUT);

/**
 * 公開ブログ一覧の queryOptions factory。
 * loader と hook の双方から参照する単一ソース。
 */
export const getBlogPostsQueryOptions = () =>
	queryOptions({
		queryKey: getQueryKey(trpc.blog.getAll, PUBLIC_BLOG_LIST_INPUT, "query"),
		queryFn: getBlogPosts,
	});

/**
 * 公開ブログ一覧を Suspense 経由で取得するフック。
 * loader でプリフェッチ済みのキャッシュをそのまま再利用する。
 */
export const useBlogPosts = () => {
	const { data } = useSuspenseQuery(getBlogPostsQueryOptions());
	return data;
};
