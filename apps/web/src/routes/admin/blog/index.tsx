import { createFileRoute } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";
import { BlogList } from "./-components/BlogList";
import { BlogListError } from "./-components/BlogListError";
import { BlogListPending } from "./-components/BlogListPending";

const ADMIN_BLOG_LIST_INPUT = { limit: 100 } as const;

const BlogAdmin = () => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<BlogList />
		</main>
	);
};

export const Route = createFileRoute("/admin/blog/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData({
			queryKey: getQueryKey(trpc.blog.getAll, ADMIN_BLOG_LIST_INPUT, "query"),
			queryFn: () => trpcClient.blog.getAll.query(ADMIN_BLOG_LIST_INPUT),
		}),
	pendingComponent: BlogListPending,
	errorComponent: BlogListError,
	component: BlogAdmin,
});
