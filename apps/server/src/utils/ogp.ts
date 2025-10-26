import { initWasm, Resvg } from "@resvg/resvg-wasm";
import type React from "react";
import satori from "satori";

/**
 * OGP画像生成の設定
 */
const OGP_CONFIG = {
	width: 1200,
	height: 630,
	baseImagePath: "/burio.com_ogp.png", // public配下のパス
};

/**
 * resvg-wasmの初期化状態を管理
 */
let resvgInitialized = false;

/**
 * resvg-wasmを初期化
 */
async function initResvg(): Promise<void> {
	if (resvgInitialized) return;

	try {
		// WASMファイルをフェッチして初期化
		const wasmUrl = "https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm";
		const response = await fetch(wasmUrl);
		const wasmBinary = await response.arrayBuffer();
		await initWasm(wasmBinary);
		resvgInitialized = true;
		console.log("✅ resvg-wasm initialized");
	} catch (error) {
		console.error("❌ Failed to initialize resvg-wasm:", error);
		throw error;
	}
}

/**
 * Noto Sans JPフォントデータを取得
 * Cloudflare Workersの環境では、フォントデータをバイナリで持つ必要がある
 */
async function getNotoSansJPFont(): Promise<ArrayBuffer> {
	// Google FontsからNoto Sans JPを取得
	const response = await fetch(
		"https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzsd_-0q4.woff",
	);

	if (!response.ok) {
		throw new Error("Failed to fetch Noto Sans JP font");
	}

	return response.arrayBuffer();
}

/**
 * 記事タイトルを使用してOGP画像のSVGを生成
 *
 * @param title - ブログ記事のタイトル
 * @param baseImageUrl - ベース画像のURL（R2またはpublic配下）
 * @returns SVG形式のOGP画像
 */
export async function generateOGPImage(
	title: string,
	baseImageUrl?: string,
): Promise<string> {
	try {
		// フォントデータを取得
		const fontData = await getNotoSansJPFont();

		// タイトルを適切な長さに調整（長すぎる場合は省略）
		const displayTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;

		// SVGマークアップを生成
		const element: React.ReactElement = {
			type: "div",
			props: {
				style: {
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "flex-end",
					position: "relative",
					background: baseImageUrl
						? `url(${baseImageUrl})`
						: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					backgroundSize: "cover",
					backgroundPosition: "center",
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
								padding: "40px 60px",
								width: "100%",
								background:
									"linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
							},
							children: [
								{
									type: "div",
									props: {
										style: {
											fontSize: 48,
											fontWeight: 700,
											color: "white",
											textAlign: "center",
											lineHeight: 1.4,
											textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
											maxWidth: "1000px",
											wordBreak: "break-word",
										},
										children: displayTitle,
									},
								},
							],
						},
					},
				],
			},
			key: null,
		} as React.ReactElement;

		const svg = await satori(element, {
			width: OGP_CONFIG.width,
			height: OGP_CONFIG.height,
			fonts: [
				{
					name: "Noto Sans JP",
					data: fontData,
					weight: 700,
					style: "normal",
				},
			],
		});

		// SVG文字列を返す
		return svg;
	} catch (error) {
		console.error("❌ Error generating OGP image:", error);
		throw error;
	}
}

/**
 * SVGをPNGに変換
 *
 * @param svgString - SVG文字列
 * @returns PNG画像バッファ
 */
export async function svgToPng(svgString: string): Promise<ArrayBuffer> {
	try {
		// resvg-wasmを初期化
		await initResvg();

		// ResvgでPNGに変換
		const resvg = new Resvg(svgString, {
			fitTo: {
				mode: "width",
				value: OGP_CONFIG.width,
			},
		});

		const pngData = resvg.render();
		const pngBuffer = pngData.asPng();

		console.log(`✅ SVG converted to PNG (${pngBuffer.length} bytes)`);

		// Uint8ArrayをArrayBufferに変換
		return pngBuffer.buffer as ArrayBuffer;
	} catch (error) {
		console.error("❌ Error converting SVG to PNG:", error);
		throw error;
	}
}

/**
 * R2にOGP画像を保存
 *
 * @param r2Bucket - Cloudflare R2バケット
 * @param postId - ブログ記事のID
 * @param imageBuffer - 画像バッファ
 * @returns R2に保存されたOGP画像のキー
 */
export async function saveOGPImageToR2(
	r2Bucket: R2Bucket,
	postId: number,
	imageBuffer: ArrayBuffer,
): Promise<string> {
	const key = `blog/ogp/${postId}.png`;

	try {
		await r2Bucket.put(key, imageBuffer, {
			httpMetadata: {
				contentType: "image/png",
			},
		});

		console.log(`✅ OGP image saved to R2: ${key}`);
		return key;
	} catch (error) {
		console.error("❌ Error saving OGP image to R2:", error);
		throw error;
	}
}

/**
 * R2に保存されたOGP画像のURLを生成
 *
 * @param r2PublicUrl - R2バケットのパブリックURL
 * @param postId - ブログ記事のID
 * @returns OGP画像のURL
 */
export function getOGPImageUrl(r2PublicUrl: string, postId: number): string {
	return `${r2PublicUrl}/blog/ogp/${postId}.png`;
}
