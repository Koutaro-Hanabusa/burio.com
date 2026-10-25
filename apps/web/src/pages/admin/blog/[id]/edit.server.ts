import { defineHandler, defineHead, type InferProps } from "void";
import { requireAdmin } from "@/server/auth/guard";
import { getPost, updatePost } from "@/server/posts";
import { editorSchema } from "../new/index.server";
import { parseTagsInput } from "@/features/blog/utils/parse-tags";
import { sitePageHead } from "@/server/site-head";

export const loader = defineHandler(async (c) => {
	const denied = await requireAdmin(c, true);
	if (denied) return denied;
	const id = Number(c.req.param("id"));
	if (!Number.isSafeInteger(id) || id < 1) return c.text("Not Found", 404);
	const post = await getPost(c.env, id, false);
	if (!post) return c.text("Not Found", 404);
	return { post };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead<Props>((_c, { post }) =>
	sitePageHead({
		title: `${post.title} を編集 | burio16.com`,
		path: `/admin/blog/${post.id}/edit`,
		description: "burio16.com のブログ記事編集",
		noIndex: true,
	}),
);

export const action = defineHandler.withValidator({ body: editorSchema })(
	async (c, { body }) => {
		const denied = await requireAdmin(c);
		if (denied) return denied;
		const id = Number(c.req.param("id"));
		if (!Number.isSafeInteger(id) || id < 1) return c.text("Not Found", 404);
		if (
			!(await updatePost(c.env, id, {
				...body,
				tags: parseTagsInput(body.tags),
			}))
		)
			return c.text("Not Found", 404);
		return c.redirect("/admin/blog");
	},
);
