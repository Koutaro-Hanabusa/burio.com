import { defineHandler, defineHead, type InferProps } from "void";
import { getPost } from "@/server/posts";

export const loader = defineHandler(async (c) => {
	const id = Number(c.req.param("id"));
	if (!Number.isSafeInteger(id) || id < 1) return c.text("Not Found", 404);
	const post = await getPost(c.env, id, true);
	if (!post) return c.text("Not Found", 404);
	return { post };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead<Props>((_c, { post }) => ({
	title: post.title,
	meta: [
		{ name: "description", content: post.excerpt || "" },
		{ property: "og:type", content: "article" },
		{ property: "og:title", content: post.title },
		{ property: "og:description", content: post.excerpt || "" },
		{
			property: "og:image",
			content: `https://burio16.com/api/og/blog/${post.id}`,
		},
		{ property: "og:url", content: `https://burio16.com/blog/${post.id}` },
		{ property: "og:image:alt", content: `${post.title} のサムネイル` },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: post.title },
		{ name: "twitter:description", content: post.excerpt || "" },
		{
			name: "twitter:image",
			content: `https://burio16.com/api/og/blog/${post.id}`,
		},
		{ name: "twitter:image:alt", content: `${post.title} のサムネイル` },
		{ name: "twitter:url", content: `https://burio16.com/blog/${post.id}` },
	],
	link: [{ rel: "canonical", href: `https://burio16.com/blog/${post.id}` }],
}));
