import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

type GetAdminBlogPostInput = {
	id: number;
};

/**
 * 管理画面ブログ詳細を取得する純関数。
 * 公開ブログ詳細と同じ tRPC エンドポイント（blog.getById）を共有する。
 */
export const getAdminBlogPost = ({ id }: GetAdminBlogPostInput) =>
	trpcClient.blog.getById.query({ id });

/**
 * 管理画面ブログ詳細の queryOptions factory。
 * loader と hook の双方から参照する単一ソース。
 */
export const getAdminBlogPostQueryOptions = (id: number) =>
	queryOptions({
		queryKey: getQueryKey(trpc.blog.getById, { id }, "query"),
		queryFn: () => getAdminBlogPost({ id }),
	});

/**
 * 管理画面ブログ詳細を Suspense 経由で取得するフック。
 */
export const useAdminBlogPost = (id: number) => {
	const { data } = useSuspenseQuery(getAdminBlogPostQueryOptions(id));
	return data;
};
