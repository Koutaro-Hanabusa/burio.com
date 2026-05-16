// READ ONLY: web Worker は post 取得のみ。insert/update/delete 禁止。
import { ImageResponse } from "workers-og";
import {
	OG_BG_IMAGE_KEY,
	OG_CACHE_CONTROL,
	OG_FONT_URL,
	OG_HEIGHT,
	OG_WIDTH,
} from "./constants";
import { buildOgImageHtml } from "./build-og-html";
import { arrayBufferToBase64 } from "./utils";

interface PostRow {
	title: string;
	excerpt: string | null;
	tags: string | null;
	published: number;
}

interface BuildOgResponseOptions {
	db: D1Database;
	r2: R2Bucket;
	id: number;
}

export async function buildOgResponse({
	db,
	r2,
	id,
}: BuildOgResponseOptions): Promise<Response> {
	try {
		const row = await db
			.prepare(
				"SELECT title, excerpt, tags, published FROM posts WHERE id = ? LIMIT 1",
			)
			.bind(id)
			.first<PostRow>();

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

		const imageResponse = new ImageResponse(html, {
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

		return new Response(imageResponse.body, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": OG_CACHE_CONTROL,
			},
		});
	} catch (error) {
		console.error("OG image generation error:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
