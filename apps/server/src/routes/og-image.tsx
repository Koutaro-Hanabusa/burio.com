import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../db";
import { posts } from "../db/schema";

/**
 * 動的OGP画像生成エンドポイント
 *
 * 機能:
 * - ブログ記事のタイトルと概要を含むOGP画像を生成
 * - Google Fonts APIから日本語フォント（Noto Sans JP）を取得
 * - 美しいグラデーション背景 + 白いカードデザイン
 * - タイトルの長さに応じたフォントサイズ調整
 *
 * @param c - Hono Context
 * @returns ImageResponse (PNG画像)
 */
export async function generateOgImage(c: Context) {
	try {
		const id = c.req.param("id");
		const postId = Number.parseInt(id, 10);

		if (Number.isNaN(postId)) {
			return c.text("Invalid post ID", 400);
		}

		// データベースから記事を取得
		const post = await db
			.select({
				title: posts.title,
				excerpt: posts.excerpt,
			})
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);

		if (!post || post.length === 0) {
			return c.text("Post not found", 404);
		}

		const postData = post[0];

		// Google Fonts APIから日本語フォントを取得
		const fontText = [postData.title, postData.excerpt || ""].join("");
		const fontUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(fontText)}`;

		let fontData: ArrayBuffer | undefined;

		try {
			const fontCssResponse = await fetch(fontUrl);
			const fontCss = await fontCssResponse.text();

			// CSSからTTFファイルのURLを抽出
			const fontUrlMatch = fontCss.match(/url\(([^)]+\.ttf)\)/);

			if (fontUrlMatch?.[1]) {
				const ttfResponse = await fetch(fontUrlMatch[1]);
				if (ttfResponse.ok) {
					fontData = await ttfResponse.arrayBuffer();
				}
			}
		} catch (error) {
			console.error("Error fetching font:", error);
			// フォントの取得に失敗してもデフォルトフォントで画像生成を続行
		}

		// タイトルの長さに応じてフォントサイズを調整
		const titleLength = postData.title.length;
		let titleFontSize = "60px";
		if (titleLength > 40) {
			titleFontSize = "48px";
		} else if (titleLength > 30) {
			titleFontSize = "52px";
		}

		// 概要テキストの処理（長い場合は省略）
		const maxExcerptLength = 120;
		let excerptText = postData.excerpt || "";
		if (excerptText.length > maxExcerptLength) {
			excerptText = `${excerptText.substring(0, maxExcerptLength)}...`;
		}

		return new ImageResponse(
			<div
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					padding: "60px",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						height: "100%",
						backgroundColor: "white",
						borderRadius: "24px",
						padding: "60px",
						boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
						justifyContent: "space-between",
					}}
				>
					{/* タイトル */}
					<h1
						style={{
							fontSize: titleFontSize,
							fontWeight: 700,
							lineHeight: 1.3,
							color: "#1a202c",
							margin: 0,
							fontFamily: fontData ? "Noto Sans JP" : "sans-serif",
							display: "flex",
							wordBreak: "break-word",
						}}
					>
						{postData.title}
					</h1>

					{/* 概要 */}
					{excerptText && (
						<p
							style={{
								fontSize: "28px",
								lineHeight: 1.6,
								color: "#4a5568",
								margin: 0,
								fontFamily: fontData ? "Noto Sans JP" : "sans-serif",
								display: "flex",
								wordBreak: "break-word",
							}}
						>
							{excerptText}
						</p>
					)}

					{/* フッター */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginTop: "auto",
							paddingTop: "40px",
							borderTop: "2px solid #e2e8f0",
						}}
					>
						<div
							style={{
								fontSize: "24px",
								fontWeight: 600,
								color: "#667eea",
								display: "flex",
							}}
						>
							burio16.com
						</div>
						<div
							style={{
								fontSize: "20px",
								color: "#718096",
								display: "flex",
							}}
						>
							ブログ記事
						</div>
					</div>
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: fontData
					? [
							{
								name: "Noto Sans JP",
								data: fontData,
								weight: 700,
							},
						]
					: undefined,
			},
		);
	} catch (error) {
		console.error("Error generating OG image:", error);

		// エラー時はフォールバック画像を返す
		return new ImageResponse(
			<div
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				}}
			>
				<div
					style={{
						fontSize: "48px",
						fontWeight: 700,
						color: "white",
						display: "flex",
					}}
				>
					burio16.com
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
			},
		);
	}
}
