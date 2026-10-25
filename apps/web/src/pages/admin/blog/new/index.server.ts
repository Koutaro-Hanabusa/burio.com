import { defineHandler, defineHead } from "void";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/guard";
import { createPost } from "@/server/posts";
import { parseTagsInput } from "@/features/blog/utils/parse-tags";
import { sitePageHead } from "@/server/site-head";

export const head = defineHead(() =>
	sitePageHead({
		title: "新しい記事 | burio16.com",
		path: "/admin/blog/new",
		description: "burio16.com の新しいブログ記事",
		noIndex: true,
	}),
);

export const editorSchema = z.object({
	title: z.string().trim().min(1),
	content: z.string(),
	excerpt: z.string(),
	coverImage: z.string(),
	tags: z.string(),
	published: z.boolean(),
});

export const loader = defineHandler(async (c) => {
	const denied = await requireAdmin(c, true);
	if (denied) return denied;
	return {};
});

export const action = defineHandler.withValidator({ body: editorSchema })(
	async (c, { body }) => {
		const denied = await requireAdmin(c);
		if (denied) return denied;
		await createPost(c.env, { ...body, tags: parseTagsInput(body.tags) });
		return c.redirect("/admin/blog");
	},
);
