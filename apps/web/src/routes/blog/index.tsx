import { createFileRoute } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { PUBLIC_BLOG_LIST_INPUT } from "@/features/blog/constants/queries";
import { trpc, trpcClient } from "@/utils/trpc";
import { BlogIndexError } from "./-components/fallbacks/BlogIndexError";
import { BlogIndexPending } from "./-components/fallbacks/BlogIndexPending";
import { BlogListPage } from "./-components/pages/BlogListPage";

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
