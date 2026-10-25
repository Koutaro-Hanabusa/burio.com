import { defineHandler, defineHead } from "void";
import { requireAdmin } from "@/server/auth/guard";
import { sitePageHead } from "@/server/site-head";

export const head = defineHead(() =>
	sitePageHead({
		title: "管理画面 | burio16.com",
		path: "/admin",
		description: "burio16.com 管理画面",
		noIndex: true,
	}),
);

export const loader = defineHandler(async (c) => {
	const denied = await requireAdmin(c, true);
	if (denied) return denied;
	return {};
});
