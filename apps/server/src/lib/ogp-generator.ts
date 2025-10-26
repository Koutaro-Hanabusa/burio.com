import type { ReactElement } from "react";
import satori from "satori";

export interface OGPOptions {
	title: string;
	siteName?: string;
	width?: number;
	height?: number;
}

export interface OGPResult {
	svg: string;
	contentType: "image/svg+xml";
}

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 630;

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
		width = DEFAULT_WIDTH,
		height = DEFAULT_HEIGHT,
	} = options;

	// Define the structure for the OGP image as a plain object that satori can handle
	const element = {
		type: "div",
		props: {
			style: {
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				padding: "60px",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: "40px",
							width: "100%",
						},
						children: [
							// Title
							{
								type: "div",
								props: {
									style: {
										fontSize: 64,
										fontWeight: "bold",
										color: "white",
										lineHeight: 1.2,
										textAlign: "center",
										wordWrap: "break-word",
										maxWidth: "100%",
									},
									children: title,
								},
							},
							// Site name
							{
								type: "div",
								props: {
									style: {
										fontSize: 32,
										color: "rgba(255, 255, 255, 0.9)",
										textAlign: "center",
										marginTop: "auto",
									},
									children: siteName,
								},
							},
						],
					},
				},
			],
		},
	};

	// Fetch fonts
	const [regularFont, boldFont] = await Promise.all([
		fetchNotoSansJPFont("400"),
		fetchNotoSansJPFont("700"),
	]);

	// Generate SVG using satori
	const svg = await satori(element as unknown as ReactElement, {
		width,
		height,
		fonts: [
			{
				name: "Noto Sans JP",
				data: regularFont,
				weight: 400,
				style: "normal",
			},
			{
				name: "Noto Sans JP",
				data: boldFont,
				weight: 700,
				style: "normal",
			},
		],
	});

	return {
		svg,
		contentType: "image/svg+xml",
	};
}

/**
 * Fetch Noto Sans JP font from Google Fonts
 * This ensures proper Japanese text rendering
 */
async function fetchNotoSansJPFont(
	weight: "400" | "700" = "400",
): Promise<ArrayBuffer> {
	const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}`;

	const css = await fetch(API, {
		headers: {
			// Specify User-Agent to get TTF format
			"User-Agent":
				"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
		},
	}).then((res) => res.text());

	// Extract font URL from CSS
	const fontUrl = css.match(
		/src: url\((.+?)\) format\('(opentype|truetype)'\)/,
	)?.[1];

	if (!fontUrl) {
		throw new Error("Failed to fetch font URL from Google Fonts");
	}

	// Fetch the actual font file
	const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

	return fontData;
}
