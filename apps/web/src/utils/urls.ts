/**
 * ブログ記事のURLを取得
 * 本番環境ではblog.burio16.com、開発環境ではローカルのパスを使用
 */
export function getBlogPostUrl(id: number | string): string {
	const blogBaseUrl = import.meta.env.VITE_BLOG_URL;

	if (blogBaseUrl) {
		return `${blogBaseUrl}/${id}`;
	}

	// 開発環境ではローカルパスを使用
	return `/blog/${id}`;
}

/**
 * OGP画像のURLを取得
 */
export function getBlogOgImageUrl(id: number | string): string {
	const blogBaseUrl = import.meta.env.VITE_BLOG_URL;

	if (blogBaseUrl) {
		return `${blogBaseUrl}/${id}/og.png`;
	}

	return `https://burio16.com/blog/${id}.png`;
}
