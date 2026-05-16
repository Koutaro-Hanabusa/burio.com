import { createServerFn } from "@tanstack/react-start";
import { createServerTrpcClient } from "@/utils/trpc.server";

const PUBLIC_BLOG_LIST_INPUT = { limit: 50, published: true } as const;

export const getBlogPosts = createServerFn({ method: "GET" }).handler(
	async () => {
		const trpc = createServerTrpcClient();
		return trpc.blog.getAll.query(PUBLIC_BLOG_LIST_INPUT);
	},
);
