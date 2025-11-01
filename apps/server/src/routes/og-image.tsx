import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../db";
import { posts } from "../db/schema";

/**
 * 動的OGP画像生成エンドポイント
 *
 * 機能:
 * - ブログ記事のタイトルを含むOGP画像を生成
 * - R2バケットから既存のOGPテンプレート画像を取得して背景に使用
 * - Google Fonts APIから日本語フォント（Noto Sans JP）を取得
 * - テンプレート画像の上にタイトルを半透明のオーバーレイで重ねる
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
			})
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);

		if (!post || post.length === 0) {
			return c.text("Post not found", 404);
		}

		const postData = post[0];

		// R2バケットまたはHTTPSから公開OGPテンプレート画像を取得
		let base64Image: string | undefined;
		try {
			let imageData: ArrayBuffer | undefined;

			// まずR2バケットから取得を試みる
			if (c.env?.R2_BUCKET) {
				try {
					console.log(
						"Attempting to fetch OGP template from R2: burio.com_ogp.png",
					);
					const r2Object = await c.env.R2_BUCKET.get("burio.com_ogp.png");
					if (r2Object) {
						const fetchedData = await r2Object.arrayBuffer();
						imageData = fetchedData;
						console.log(
							"Successfully fetched image from R2, size:",
							fetchedData.byteLength,
							"bytes",
						);
					} else {
						console.log("Image not found in R2, falling back to HTTPS");
					}
				} catch (r2Error) {
					console.error("Error fetching from R2:", r2Error);
					console.log("Falling back to HTTPS");
				}
			}

			// R2で取得できなかった場合はHTTPSから取得
			if (!imageData) {
				console.log(
					"Fetching OGP template image from: https://burio16.com/burio.com_ogp.png",
				);
				const imageResponse = await fetch(
					"https://burio16.com/burio.com_ogp.png",
				);
				console.log(
					"Image fetch response status:",
					imageResponse.status,
					imageResponse.statusText,
				);

				if (imageResponse.ok) {
					const fetchedData = await imageResponse.arrayBuffer();
					imageData = fetchedData;
					console.log("Image data size:", fetchedData.byteLength, "bytes");
				} else {
					console.error(
						"Failed to fetch image, status:",
						imageResponse.status,
						imageResponse.statusText,
					);
				}
			}

			// 画像データをBase64に変換
			if (imageData) {
				const bytes = new Uint8Array(imageData);
				let binary = "";
				for (let i = 0; i < bytes.byteLength; i++) {
					binary += String.fromCharCode(bytes[i]);
				}
				base64Image = btoa(binary);
				console.log(
					"Successfully converted image to base64, length:",
					base64Image.length,
				);
			}
		} catch (error) {
			console.error("Error fetching OGP template:", error);
			console.error(
				"Error details:",
				error instanceof Error ? error.message : String(error),
			);
			// テンプレート画像の取得に失敗してもフォールバックで処理を続行
		}

		// Google Fonts APIから日本語フォントを取得
		const fontText = postData.title;
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
		if (titleLength > 50) {
			titleFontSize = "44px";
		} else if (titleLength > 40) {
			titleFontSize = "48px";
		} else if (titleLength > 30) {
			titleFontSize = "52px";
		}

		// テンプレート画像が取得できた場合はそれを使用、できなかった場合はフォールバック
		if (base64Image) {
			return new ImageResponse(
				<div
					style={{
						display: "flex",
						width: "100%",
						height: "100%",
						position: "relative",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{/* 背景画像: 既存のOGPテンプレート */}
					<img
						src={`data:image/png;base64,${base64Image}`}
						alt="background"
						width="1200"
						height="630"
						style={{ position: "absolute", top: 0, left: 0 }}
					/>

					{/* タイトルボックス */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							background: "white",
							padding: "50px 80px",
							borderRadius: "24px",
							maxWidth: "900px",
							border: "4px solid #FF6B35",
							boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
						}}
					>
						<h1
							style={{
								fontSize: titleFontSize,
								fontWeight: 700,
								color: "#1a202c",
								margin: 0,
								lineHeight: 1.3,
								fontFamily: fontData ? "Noto Sans JP" : "sans-serif",
								textAlign: "center",
								wordBreak: "break-word",
							}}
						>
							{postData.title}
						</h1>
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
		}

		// フォールバック: テンプレート画像が取得できなかった場合はシンプルなデザイン
		return new ImageResponse(
			<div
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
					alignItems: "center",
					justifyContent: "center",
					background: "white",
					padding: "60px",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						height: "100%",
						justifyContent: "center",
						alignItems: "center",
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
							textAlign: "center",
							fontFamily: fontData ? "Noto Sans JP" : "sans-serif",
							display: "flex",
							wordBreak: "break-word",
						}}
					>
						{postData.title}
					</h1>

					{/* サイト名 */}
					<div
						style={{
							marginTop: "60px",
							fontSize: "32px",
							fontWeight: 600,
							color: "#FF6B35",
							display: "flex",
						}}
					>
						burio16.com
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

		// エラー時はシンプルなフォールバック画像を返す
		return new ImageResponse(
			<div
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
					alignItems: "center",
					justifyContent: "center",
					background: "white",
				}}
			>
				<div
					style={{
						fontSize: "48px",
						fontWeight: 700,
						color: "#FF6B35",
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
