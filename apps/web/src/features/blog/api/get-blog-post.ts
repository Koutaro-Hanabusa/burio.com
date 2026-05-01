import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

type GetBlogPostInput = {
	id: number;
};

/**
 * 公開ブログ詳細を取得する純関数。
 */
export const getBlogPost = ({ id }: GetBlogPostInput) =>
	trpcClient.blog.getById.query({ id });

/**
 * 公開ブログ詳細の queryOptions factory。
 * loader と hook の双方から参照する単一ソース。
 */
export const getBlogPostQueryOptions = (id: number) =>
	queryOptions({
		queryKey: getQueryKey(trpc.blog.getById, { id }, "query"),
		queryFn: () => getBlogPost({ id }),
	});

/**
 * 公開ブログ詳細を Suspense 経由で取得するフック。
 */
export const useBlogPost = (id: number) => {
	const { data } = useSuspenseQuery(getBlogPostQueryOptions(id));
	return data;
};
