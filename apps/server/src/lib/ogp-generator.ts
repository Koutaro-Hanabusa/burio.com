import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactElement } from "react";
import satori, { type SatoriOptions } from "satori";

export interface OGPOptions {
	title: string;
	siteName?: string;
	width?: number;
	height?: number;
	baseImageUrl?: string;
}

export interface OGPResult {
	svg: string;
	contentType: "image/svg+xml";
}

/**
 * Generate OGP image for blog posts
 * Uses satori to convert JSX to SVG
 * Returns SVG string that can be directly served as an image
 */
export async function generateOGPImage(
	options: OGPOptions,
): Promise<OGPResult> {
	const {
		title,
		siteName = "burio16.com",
		width = 1200,
		height = 600,
		baseImageUrl = "https://burio16.com/burio.com_ogp.png",
	} = options;

	// Load Japanese font
	const fontPath = join(
		process.cwd(),
		"src/assets/fonts/NotoSansJP-Regular.ttf",
	);
	const fontData = await readFile(fontPath);

	// Generate SVG using satori
	const svg = await satori(
		{
			type: "div",
			props: {
				style: {
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
					backgroundImage: `url(${baseImageUrl})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					padding: "60px",
				},
				children: [
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								background:
									"linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))",
								padding: "40px 60px",
								borderRadius: "20px",
								maxWidth: "90%",
								boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
							},
							children: [
								{
									type: "h1",
									props: {
										style: {
											fontSize: 64,
											fontWeight: 700,
											color: "#ffffff",
											textAlign: "center",
											margin: 0,
											lineHeight: 1.3,
											textShadow: "0 4px 12px rgba(0, 0, 0, 0.8)",
										},
										children: title,
									},
								},
								{
									type: "p",
									props: {
										style: {
											fontSize: 28,
											color: "#e0e0e0",
											textAlign: "center",
											marginTop: "20px",
											margin: 0,
										},
										children: siteName,
									},
								},
							],
						},
					},
				],
			},
		} as ReactElement,
		{
			width,
			height,
			fonts: [
				{
					name: "Noto Sans JP",
					data: fontData,
					weight: 400,
					style: "normal",
				},
			],
		},
	);

	return {
		svg,
		contentType: "image/svg+xml",
	};
}
