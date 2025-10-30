/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

/**
 * GET /test-og
 *
 * 最小限のテストエンドポイント
 * ImageResponseの基本動作を確認
 */
export const onRequestGet = async () => {
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
					fontSize: "64px",
					fontWeight: 700,
					color: "white",
				}}
			>
				Test OG Image
			</div>,
			{
				width: 1200,
				height: 630,
			},
		);
	} catch (error) {
		console.error("Error:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to generate image",
				message: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
