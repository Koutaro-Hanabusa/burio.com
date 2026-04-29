import { createFileRoute } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";
import { BlogIndexError } from "./-components/BlogIndexError";
import { BlogIndexPending } from "./-components/BlogIndexPending";
import { BlogListPage } from "./-components/BlogListPage";

const PUBLIC_BLOG_LIST_INPUT = { limit: 50, published: true } as const;

export const Route = createFileRoute("/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData({
			queryKey: getQueryKey(trpc.blog.getAll, PUBLIC_BLOG_LIST_INPUT, "query"),
			queryFn: () => trpcClient.blog.getAll.query(PUBLIC_BLOG_LIST_INPUT),
		}),
	pendingComponent: BlogIndexPending,
	errorComponent: BlogIndexError,
	component: BlogListPage,
});
