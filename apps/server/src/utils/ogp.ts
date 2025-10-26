/**
 * R2にOGP SVG画像を保存
 *
 * @param r2Bucket - Cloudflare R2バケット
 * @param postId - ブログ記事のID
 * @param svgString - SVG文字列
 * @returns R2に保存されたOGP画像のキー
 */
export async function saveOGPImageToR2(
	r2Bucket: R2Bucket,
	postId: number,
	svgString: string,
): Promise<string> {
	const key = `ogp/${postId}.svg`;

	await r2Bucket.put(key, svgString, {
		httpMetadata: {
			contentType: "image/svg+xml",
			cacheControl: "public, max-age=31536000, immutable",
		},
	});

	console.log(`✅ OGP画像を保存しました: ${key}`);

	return key;
}

/**
 * R2に保存されたOGP画像のURLを生成
 *
 * @param r2PublicUrl - R2バケットのパブリックURL
 * @param postId - ブログ記事のID
 * @returns OGP画像のURL
 */
export function getOGPImageUrl(r2PublicUrl: string, postId: number): string {
	// Ensure the URL doesn't have a trailing slash
	const baseUrl = r2PublicUrl.replace(/\/$/, "");
	return `${baseUrl}/ogp/${postId}.svg`;
}

/**
 * 記事タイトルを使用してOGP画像を生成し、R2に保存
 *
 * @param title - ブログ記事のタイトル
 * @param postId - ブログ記事のID
 * @param r2Bucket - Cloudflare R2バケット
 * @param r2PublicUrl - R2バケットのパブリックURL
 * @returns OGP画像のURL
 */
export async function generateAndSaveOGPImage(
	title: string,
	postId: number,
	r2Bucket: R2Bucket,
	r2PublicUrl: string,
): Promise<string> {
	const { generateOGPImage } = await import("../lib/ogp-generator");

	// Generate SVG
	const { svg } = await generateOGPImage({ title });

	// Save SVG to R2 directly (Twitter/Facebook support SVG OGP images)
	await saveOGPImageToR2(r2Bucket, postId, svg);

	// Return public URL
	return getOGPImageUrl(r2PublicUrl, postId);
}
