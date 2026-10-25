import { ImageResponse } from "@cf-wasm/og";
import { htmlToReact } from "@cf-wasm/og/html-to-react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { posts } from "../schema";
import { buildOgImageHtml } from "./build-og-html";
import {
	OG_BG_IMAGE_KEY,
	OG_CACHE_CONTROL,
	OG_FONT_URL,
	OG_HEIGHT,
	OG_WIDTH,
} from "./constants";
import { arrayBufferToBase64 } from "./utils";

interface BuildOgResponseOptions {
	d1: D1Database;
	r2: R2Bucket;
	id: number;
}

export async function buildOgResponse({
	d1,
	r2,
	id,
}: BuildOgResponseOptions): Promise<Response> {
	try {
		const rows = await drizzle(d1)
			.select({
				title: posts.title,
				excerpt: posts.excerpt,
				tags: posts.tags,
				published: posts.published,
			})
			.from(posts)
			.where(eq(posts.id, id))
			.limit(1);

		const row = rows[0];
		if (!row || row.published !== 1) {
			return new Response("Not Found", { status: 404 });
		}

		const bgObject = await r2.get(OG_BG_IMAGE_KEY);
		if (!bgObject) {
			return new Response("Internal Server Error", { status: 500 });
		}

		const [fontData, bgImageBuffer] = await Promise.all([
			fetch(OG_FONT_URL).then((res) => res.arrayBuffer()),
			bgObject.arrayBuffer(),
		]);

		const bgImageDataUrl = `data:image/png;base64,${arrayBufferToBase64(bgImageBuffer)}`;

		const tags: string[] = row.tags ? JSON.parse(row.tags) : [];

		const html = buildOgImageHtml({
			title: row.title,
			excerpt: row.excerpt,
			tags,
			bgImageDataUrl,
		});

		const imageResponse = new ImageResponse(htmlToReact(html), {
			width: OG_WIDTH,
			height: OG_HEIGHT,
			fonts: [
				{
					name: "Noto Sans JP",
					data: fontData,
					weight: 700,
					style: "normal",
				},
			],
		});

		imageResponse.headers.set("Cache-Control", OG_CACHE_CONTROL);
		imageResponse.headers.set("Content-Type", "image/png");
		return imageResponse;
	} catch (error) {
		console.error("OG image generation error:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
