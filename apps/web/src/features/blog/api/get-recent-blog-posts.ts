import { queryOptions, useQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

/**
 * ホーム画面に並べる「最新のブログ記事」の取得件数。
 */
export const RECENT_BLOG_POSTS_LIMIT = 3;

const RECENT_BLOG_POSTS_INPUT = {
	limit: RECENT_BLOG_POSTS_LIMIT,
	published: true,
} as const;

/**
 * 最新ブログ記事を取得する純関数。
 */
export const getRecentBlogPosts = () =>
	trpcClient.blog.getAll.query(RECENT_BLOG_POSTS_INPUT);

/**
 * 最新ブログ記事の queryOptions factory。
 */
export const getRecentBlogPostsQueryOptions = () =>
	queryOptions({
		queryKey: getQueryKey(trpc.blog.getAll, RECENT_BLOG_POSTS_INPUT, "query"),
		queryFn: getRecentBlogPosts,
	});

/**
 * ホーム画面用の最新ブログ記事フック。
 * Suspense ではなく `useQuery` を返し、isLoading / error を呼び出し側で扱える。
 */
export const useRecentBlogPosts = () =>
	useQuery(getRecentBlogPostsQueryOptions());
