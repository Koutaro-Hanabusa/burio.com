import { env } from "cloudflare:workers";
import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { posts } from "../db/schema";
import { generateOgImage } from "../lib/ogp/image";
import { injectOGPMetaTags } from "../lib/ogp/meta";
import type { BlogPost } from "../lib/ogp/types";

const ogp = new Hono();

// シンプルなテストエンドポイント（外部リソースなし）
ogp.get("/test.png", async (c) => {
	try {
		const imageResponse = new ImageResponse(
			<div
				style={{
					display: "flex",
					width: "1200px",
					height: "630px",
					backgroundColor: "#1a1a2e",
					color: "#ffffff",
					fontSize: "64px",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				Test OGP Image
			</div>,
			{ width: 1200, height: 630 },
		);
		return new Response(imageResponse.body, {
			headers: { "Content-Type": "image/png" },
		});
	} catch (error) {
		console.error("Test OGP error:", error);
		return c.text(`Error: ${error}`, 500);
	}
});

async function fetchBlogPost(id: string): Promise<BlogPost | null> {
	const result = await db
		.select({
			id: posts.id,
			title: posts.title,
			excerpt: posts.excerpt,
			createdAt: posts.createdAt,
			tags: posts.tags,
			published: posts.published,
		})
		.from(posts)
		.where(eq(posts.id, Number(id)))
		.limit(1);
	return result[0] ?? null;
}

async function fetchPagesHtml(pagesUrl: string, id: string): Promise<Response> {
	return fetch(`${pagesUrl}/blog/${id}`);
}

// blog.burio16.com/:id/og.png - OGP画像
ogp.get("/:id/og.png", async (c) => {
	const id = c.req.param("id");
	const bgImageUrl = `${env.R2_PUBLIC_URL}/burio.com_ogp.png`;

	try {
		const post = await fetchBlogPost(id);
		if (!post) {
			return c.text("Blog post not found", 404);
		}
		return generateOgImage(post, bgImageUrl);
	} catch (error) {
		console.error("Error generating OG image:", error);
		return c.text("Failed to generate OG image", 500);
	}
});

// blog.burio16.com/:id - ブログページ（メタタグ注入）
ogp.get("/:id", async (c) => {
	const id = c.req.param("id");
	const pagesUrl = env.PAGES_URL;

	console.log("OGP meta injection request:", { id, pagesUrl });

	if (!pagesUrl) {
		console.error("PAGES_URL is not set");
		return c.text("PAGES_URL is not configured", 500);
	}

	try {
		console.log("Fetching blog post and HTML...");
		const [post, htmlResponse] = await Promise.all([
			fetchBlogPost(id),
			fetchPagesHtml(pagesUrl, id),
		]);
		console.log("Post found:", post ? "yes" : "no");
		console.log("HTML response status:", htmlResponse.status);

		const html = await htmlResponse.text();

		if (!post || !post.published) {
			console.log("Post not found or not published, returning original HTML");
			return new Response(html, {
				status: htmlResponse.status,
				headers: htmlResponse.headers,
			});
		}

		const pageUrl = `https://blog.burio16.com/${post.id}`;
		const ogImageUrl = `https://blog.burio16.com/${post.id}/og.png`;
		const modifiedHtml = injectOGPMetaTags(html, post, pageUrl, ogImageUrl);

		const headers = new Headers();
		for (const [key, value] of htmlResponse.headers.entries()) {
			headers.set(key, value);
		}
		headers.set("Content-Type", "text/html; charset=utf-8");

		console.log("Returning modified HTML with OGP tags");
		return new Response(modifiedHtml, { status: htmlResponse.status, headers });
	} catch (error) {
		console.error("Error injecting OGP meta tags:", error);
		try {
			const pagesResponse = await fetchPagesHtml(pagesUrl, id);
			return new Response(pagesResponse.body, {
				status: pagesResponse.status,
				headers: pagesResponse.headers,
			});
		} catch (fallbackError) {
			console.error("Fallback fetch also failed:", fallbackError);
			return c.text(`Error: ${error}`, 500);
		}
	}
});

export { ogp };
