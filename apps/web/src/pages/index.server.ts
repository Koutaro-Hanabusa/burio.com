import { defineHandler, defineHead, type InferProps } from "void";
import { getSession } from "void/auth";
import { listPosts } from "@/server/posts";
import { sitePageHead } from "@/server/site-head";

export const head = defineHead(() =>
	sitePageHead({
		title: "burio16.com",
		path: "/",
		description: "burio16.comへようこそ",
		socialTitle: "burio16.com　ぶりおのプロフィールサイト",
	}),
);

export const loader = defineHandler(async (c) => ({
	posts: await listPosts(c.env, true, 3),
	isAdmin: getSession() !== null,
}));

export type Props = InferProps<typeof loader>;
