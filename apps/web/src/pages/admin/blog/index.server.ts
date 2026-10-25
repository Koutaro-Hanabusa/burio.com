import { defineHandler, defineHead, type InferProps } from "void";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/guard";
import { deletePost, listPosts, setPostPublished } from "@/server/posts";
import { sitePageHead } from "@/server/site-head";

export const head = defineHead(() =>
	sitePageHead({
		title: "ブログ管理 | burio16.com",
		path: "/admin/blog",
		description: "burio16.com ブログ管理",
		noIndex: true,
	}),
);

export const loader = defineHandler(async (c) => {
	const denied = await requireAdmin(c, true);
	if (denied) return denied;
	return { posts: await listPosts(c.env, false) };
});

export type Props = InferProps<typeof loader>;

export const actions = {
	publish: defineHandler.withValidator({
		body: z.object({
			id: z.coerce.number().int().positive(),
			published: z.boolean(),
		}),
	})(async (c, { body }) => {
		const denied = await requireAdmin(c);
		if (denied) return denied;
		if (!(await setPostPublished(c.env, body.id, body.published)))
			return c.text("Not Found", 404);
	}),
	delete: defineHandler.withValidator({
		body: z.object({ id: z.coerce.number().int().positive() }),
	})(async (c, { body }) => {
		const denied = await requireAdmin(c);
		if (denied) return denied;
		if (!(await deletePost(c.env, body.id))) return c.text("Not Found", 404);
	}),
};
