import { defineHandler, defineHead, type InferProps } from "void";
import {
	getAllowedIPs,
	getClientIP,
	isIPAllowed,
} from "@/server/auth/client-ip";
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
	isAdmin: isIPAllowed(
		getClientIP(c.req.raw),
		getAllowedIPs(c.env.ADMIN_ALLOWED_IPS),
	),
}));

export type Props = InferProps<typeof loader>;
