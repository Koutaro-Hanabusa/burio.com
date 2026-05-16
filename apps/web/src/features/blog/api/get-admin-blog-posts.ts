import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

export const ADMIN_BLOG_LIST_INPUT = { limit: 100 } as const;

export const getAdminBlogPosts = () =>
	trpcClient.admin.getAllPosts.query(ADMIN_BLOG_LIST_INPUT);

export const getAdminBlogPostsQueryOptions = () =>
	queryOptions({
		queryKey: getQueryKey(
			trpc.admin.getAllPosts,
			ADMIN_BLOG_LIST_INPUT,
			"query",
		),
		queryFn: getAdminBlogPosts,
	});

export const useAdminBlogPosts = () => {
	const { data } = useSuspenseQuery(getAdminBlogPostsQueryOptions());
	return data;
};
