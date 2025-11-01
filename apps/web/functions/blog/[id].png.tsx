import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import type { D1Database, PagesFunction } from "@cloudflare/workers-types";

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

interface Env {
	DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	try {
		const { id } = context.params;
		const db = context.env.DB;

		let title = "burio.com";

		// IDが指定されている場合は、データベースから記事を取得
		if (id) {
			const postId = Number.parseInt(id as string, 10);

			if (!Number.isNaN(postId)) {
				const result = await db
					.prepare("SELECT title FROM posts WHERE id = ?")
					.bind(postId)
					.first<{ title: string }>();

				if (result) {
					title = result.title;
				}
			}
		}

		// フォントを取得
		const notoSansFont = await getFont();

		// ベース画像URL（フルパスで指定）
		const baseImageUrl = "https://burio16.com/burio.com_ogp.png";

		// ImageResponseでOG画像を生成
		const response = new ImageResponse(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundImage: `url("${baseImageUrl}")`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					fontFamily: '"Noto Sans JP", sans-serif',
					padding: "80px",
					position: "relative",
				}}
			>
				{/* 半透明オーバーレイ */}
				<div
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						background: "rgba(0, 0, 0, 0.5)",
						top: 0,
						left: 0,
					}}
				/>

				{/* タイトル */}
				<div
					style={{
						fontSize: "72px",
						fontWeight: 700,
						color: "white",
						textAlign: "center",
						lineHeight: 1.3,
						maxWidth: "1000px",
						zIndex: 10,
						textShadow: "4px 4px 8px rgba(0, 0, 0, 0.9)",
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

		// キャッシュヘッダーを設定（Cloudflareのキャッシュを効かせる）
		response.headers.set(
			"Cache-Control",
			"public, max-age=31536000, immutable",
		);
		response.headers.set("Content-Type", "image/png");

		return response;
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
};
