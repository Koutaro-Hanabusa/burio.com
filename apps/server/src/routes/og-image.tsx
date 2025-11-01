import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "../db/schema";
import { posts } from "../db/schema";

const ogImageRouter = new Hono<{
	Bindings: {
		DB: D1Database;
	};
}>();

// Noto Sans JPフォントをGoogle Fontsから取得
async function getFont(): Promise<ArrayBuffer> {
	const fontUrl =
		"https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap";

	// CSSからフォントファイルのURLを取得
	const css = await fetch(fontUrl).then((res) => res.text());
	const fontFileUrl = css.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];

	if (!fontFileUrl) {
		throw new Error("Failed to extract font URL from Google Fonts CSS");
	}

	// フォントファイルをダウンロード
	const fontResponse = await fetch(fontFileUrl);
	return fontResponse.arrayBuffer();
}

ogImageRouter.get("/", async (c) => {
	try {
		// データベース接続をコンテキストから取得
		const db = drizzle(c.env.DB, { schema });

		// クエリパラメータからIDを取得
		const idParam = c.req.query("id");

		let title = "burio.com";

		// IDが指定されている場合は、データベースから記事を取得
		if (idParam) {
			const id = Number.parseInt(idParam, 10);

			if (!Number.isNaN(id)) {
				const post = await db
					.select({ title: posts.title })
					.from(posts)
					.where(eq(posts.id, id))
					.get();

				if (post) {
					title = post.title;
				}
			}
		}

		// フォントを取得
		const notoSansFont = await getFont();

		// ImageResponseでOG画像を生成
		return new ImageResponse(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: "#FF9F66",
					fontFamily: '"Noto Sans JP", sans-serif',
					padding: "60px",
					position: "relative",
				}}
			>
				{/* タイトル */}
				<div
					style={{
						fontSize: "68px",
						fontWeight: 700,
						color: "#000000",
						textAlign: "center",
						lineHeight: 1.3,
						maxWidth: "1000px",
						zIndex: 10,
					}}
				>
					{title}
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{
						name: "Noto Sans JP",
						data: notoSansFont,
						style: "normal",
						weight: 700,
					},
				],
			},
		);
	} catch (error) {
		console.error("OG Image generation error:", error);

		// エラー時はシンプルなデフォルト画像を返す
		return new ImageResponse(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					fontFamily: "sans-serif",
				}}
			>
				<div
					style={{
						fontSize: "96px",
						fontWeight: 700,
						color: "white",
					}}
				>
					burio.com
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
			},
		);
	}
});

export { ogImageRouter };
