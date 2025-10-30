/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

// Cloudflare Pages Functions type
type Env = {};

interface BlogPost {
	id: number;
	title: string;
	excerpt?: string | null;
	content?: string | null;
	coverImage?: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
}

interface TRPCResponse {
	result: {
		data: BlogPost;
	};
}

/**
 * GET /blog/[id]/og-image
 *
 * 動的OGP画像生成エンドポイント
 * ブログ記事のタイトルと概要を含むOGP画像を生成
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
	try {
		console.log("OG Image request received");

		// 動的パラメータからIDを取得
		const { id } = context.params;
		console.log("Blog post ID:", id);

		if (!id || typeof id !== "string") {
			console.error("Invalid blog post ID:", id);
			return new Response("Invalid blog post ID", { status: 400 });
		}

		// バックエンドAPIから記事データを取得
		const apiUrl = `https://api.burio16.com/trpc/blog.getById?input=${encodeURIComponent(
			JSON.stringify({ id: Number(id) }),
		)}`;

		console.log("Fetching blog post from API:", apiUrl);
		const response = await fetch(apiUrl);

		if (!response.ok) {
			console.error("Failed to fetch blog post:", response.status);
			return new Response("Blog post not found", { status: 404 });
		}

		const data = (await response.json()) as TRPCResponse;
		console.log("API response received, has data:", !!data.result.data);

		const post = data.result.data;

		if (!post) {
			console.error("No blog post data in response");
			return new Response("Blog post not found", { status: 404 });
		}

		console.log("Blog post loaded:", post.title);

		// フォント取得 - Noto Sans JPのサブセット
		// タイトルと概要の文字だけを含むサブセットフォントを取得
		const fontText = [post.title, post.excerpt || ""].join("");
		const fontUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(
			fontText,
		)}`;

		console.log("Fetching font from:", fontUrl);

		const fontCssResponse = await fetch(fontUrl);
		const fontCss = await fontCssResponse.text();

		// CSSからフォントファイルのURLを抽出（ttf形式）
		const fontUrlMatch = fontCss.match(/url\(([^)]+\.ttf)\)/);

		let fontData: ArrayBuffer | undefined;

		if (fontUrlMatch && fontUrlMatch[1]) {
			const ttfUrl = fontUrlMatch[1];
			console.log("Fetching TTF font from:", ttfUrl);

			const ttfResponse = await fetch(ttfUrl);
			if (ttfResponse.ok) {
				fontData = await ttfResponse.arrayBuffer();
			} else {
				console.warn(
					"Failed to fetch TTF font, proceeding without custom font",
				);
			}
		} else {
			console.warn(
				"No TTF font URL found in CSS, proceeding without custom font",
			);
		}

		// タイトルの長さに応じてフォントサイズを調整
		const titleLength = post.title.length;
		const titleFontSize = titleLength > 40 ? 48 : titleLength > 25 ? 56 : 64;

		console.log("Generating image with title font size:", titleFontSize);
		console.log("Using custom font:", !!fontData);

		// JSXでOGP画像を生成
		const imageResponse = new ImageResponse(
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					padding: "80px 60px",
					fontFamily: fontData ? "Noto Sans JP" : "sans-serif",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						background: "rgba(255, 255, 255, 0.95)",
						borderRadius: "24px",
						padding: "60px 80px",
						maxWidth: "1040px",
						boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
					}}
				>
					<h1
						style={{
							fontSize: `${titleFontSize}px`,
							fontWeight: 700,
							color: "#1a202c",
							textAlign: "center",
							lineHeight: 1.3,
							margin: 0,
							marginBottom: post.excerpt ? "32px" : 0,
							maxWidth: "100%",
							wordWrap: "break-word",
						}}
					>
						{post.title}
					</h1>

					{post.excerpt && (
						<p
							style={{
								fontSize: "24px",
								color: "#4a5568",
								textAlign: "center",
								lineHeight: 1.6,
								margin: 0,
								maxWidth: "100%",
								wordWrap: "break-word",
							}}
						>
							{post.excerpt.length > 120
								? `${post.excerpt.substring(0, 120)}...`
								: post.excerpt}
						</p>
					)}

					<div
						style={{
							display: "flex",
							alignItems: "center",
							marginTop: "40px",
							fontSize: "20px",
							color: "#718096",
						}}
					>
						<span>burio16.com</span>
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
								style: "normal",
							},
						]
					: undefined,
			},
		);

		console.log("Image response created successfully");
		return imageResponse;
	} catch (error) {
		console.error("Error generating OG image:", error);
		console.error(
			"Error details:",
			error instanceof Error ? error.stack : error,
		);

		// エラー時はシンプルなエラー画像を返す
		try {
			return new ImageResponse(
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "100%",
						height: "100%",
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						fontSize: "48px",
						fontWeight: 700,
						color: "white",
						textAlign: "center",
						padding: "80px",
					}}
				>
					burio16.com
				</div>,
				{
					width: 1200,
					height: 630,
				},
			);
		} catch (fallbackError) {
			console.error("Failed to generate fallback image:", fallbackError);
			// 最終的なフォールバック：テキストレスポンス
			return new Response(
				JSON.stringify({
					error: "Failed to generate OG image",
					message: error instanceof Error ? error.message : "Unknown error",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	}
};
