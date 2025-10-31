/**
 * Cloudflare Pages Functions Middleware
 *
 * ブログ詳細ページ (/blog/:id) のOGP/Twitterメタタグを動的に書き換える
 * TwitterクローラーがJavaScriptを実行しないため、静的HTMLのメタタグを修正する必要がある
 */

interface Env {
	VITE_SERVER_URL?: string;
}

export async function onRequest(context: {
	request: Request;
	next: () => Promise<Response>;
	env: Env;
}) {
	const { request, next, env } = context;
	const url = new URL(request.url);

	// /blog/:id パターンをチェック
	const blogMatch = url.pathname.match(/^\/blog\/(\d+)$/);

	if (!blogMatch) {
		// ブログ詳細ページでなければそのまま通す
		return next();
	}

	const postId = blogMatch[1];
	const response = await next();

	// HTMLレスポンスの場合のみ処理
	const contentType = response.headers.get("content-type");
	if (!contentType?.includes("text/html")) {
		return response;
	}

	// HTMLを取得して書き換え
	const html = await response.text();
	const serverUrl =
		env.VITE_SERVER_URL ||
		"https://burio-com-server.koutarouhanabusa.workers.dev";
	const ogImageUrl = `${serverUrl}/blog/${postId}/og-image`;
	const pageUrl = `https://burio16.com/blog/${postId}`;

	// メタタグを動的な値に書き換え
	// デフォルト値（https://burio16.com/burio.com_ogp.png）を実際のOGP画像URLに置換
	const modifiedHtml = html
		// Twitter Card画像
		.replace(
			/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/g,
			`<meta name="twitter:image" content="${ogImageUrl}" />`,
		)
		// OGP画像
		.replace(
			/<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/g,
			`<meta property="og:image" content="${ogImageUrl}" />`,
		)
		// Twitter Card URL
		.replace(
			/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/>/g,
			`<meta name="twitter:url" content="${pageUrl}" />`,
		)
		// OGP URL
		.replace(
			/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/g,
			`<meta property="og:url" content="${pageUrl}" />`,
		)
		// Canonical URL
		.replace(
			/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/g,
			`<link rel="canonical" href="${pageUrl}" />`,
		);

	return new Response(modifiedHtml, {
		headers: response.headers,
	});
}
