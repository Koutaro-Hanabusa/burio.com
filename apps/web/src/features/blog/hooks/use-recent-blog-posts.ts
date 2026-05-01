import { trpc } from "@/utils/trpc";

/**
 * ホーム画面に並べる「最新のブログ記事」の取得件数。
 */
export const RECENT_BLOG_POSTS_LIMIT = 3;

/**
 * ホーム画面用の最新ブログ記事フック。
 * Suspense ではなく `useQuery` を返し、isLoading / error を呼び出し側で扱える。
 */
export const useRecentBlogPosts = () =>
	trpc.blog.getAll.useQuery({
		limit: RECENT_BLOG_POSTS_LIMIT,
		published: true,
	});
