import { defineHandler, defineHead, type InferProps } from "void";
import { getSession } from "void/auth";
import { sitePageHead } from "@/server/site-head";

export const head = defineHead(() =>
	sitePageHead({
		title: "管理者ログイン | burio16.com",
		path: "/admin/login",
		description: "burio16.com 管理者ログイン",
		noIndex: true,
	}),
);

export const loader = defineHandler((c) => {
	if (getSession()) return c.redirect("/admin");
	return { authError: Boolean(c.req.query("error")) };
});

export type Props = InferProps<typeof loader>;
