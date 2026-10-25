import { defineHandler, defineHead, type InferProps } from "void";
import { listPosts } from "@/server/posts";
import { sitePageHead } from "@/server/site-head";

export const head = defineHead(() =>
	sitePageHead({
		title: "ブログ | burio16.com",
		path: "/blog",
		description: "burio16.com のブログ記事一覧",
	}),
);

export const loader = defineHandler(async (c) => ({
	posts: await listPosts(c.env, true),
}));
export type Props = InferProps<typeof loader>;
