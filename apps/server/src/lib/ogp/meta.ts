import type { BlogPost } from "./types";
import { escapeHtml, truncateText } from "./utils";

/**
 * 相対パスを絶対パスに変換する
 */
function rewriteAssetPaths(html: string, baseUrl: string): string {
	return html
		.replace(/src="\/assets\//g, `src="${baseUrl}/assets/`)
		.replace(/href="\/assets\//g, `href="${baseUrl}/assets/`)
		.replace(/href="\/fonts\//g, `href="${baseUrl}/fonts/`)
		.replace(/src="\/fonts\//g, `src="${baseUrl}/fonts/`)
		.replace(/href="\/favicon/g, `href="${baseUrl}/favicon`)
		.replace(/href="\/manifest/g, `href="${baseUrl}/manifest`)
		.replace(/href="\/burio/g, `href="${baseUrl}/burio`);
}

export function injectOGPMetaTags(
	html: string,
	post: BlogPost,
	pageUrl: string,
	ogImageUrl: string,
	pagesBaseUrl: string,
): string {
	const title = escapeHtml(truncateText(post.title, 60));
	const description = escapeHtml(truncateText(post.excerpt || "", 160));
	const fullTitle = `${title} | burio16.com`;

	const rewrittenHtml = rewriteAssetPaths(html, pagesBaseUrl);

	return rewrittenHtml
		.replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`)
		.replace(
			/<meta\s+name="description"\s+content="[^"]*"/,
			`<meta name="description" content="${description}"`,
		)
		.replace(
			/<meta\s+property="og:type"\s+content="[^"]*"/,
			`<meta property="og:type" content="article"`,
		)
		.replace(
			/<meta\s+property="og:title"\s+content="[^"]*"/,
			`<meta property="og:title" content="${title}"`,
		)
		.replace(
			/<meta\s+property="og:description"\s+content="[^"]*"/,
			`<meta property="og:description" content="${description}"`,
		)
		.replace(
			/<meta\s+property="og:url"\s+content="[^"]*"/,
			`<meta property="og:url" content="${pageUrl}"`,
		)
		.replace(
			/<meta\s+property="og:image"\s+content="[^"]*"/,
			`<meta property="og:image" content="${ogImageUrl}"`,
		)
		.replace(
			/<meta\s+name="twitter:title"\s+content="[^"]*"/,
			`<meta name="twitter:title" content="${title}"`,
		)
		.replace(
			/<meta\s+name="twitter:description"\s+content="[^"]*"/,
			`<meta name="twitter:description" content="${description}"`,
		)
		.replace(
			/<meta\s+name="twitter:image"\s+content="[^"]*"/,
			`<meta name="twitter:image" content="${ogImageUrl}"`,
		)
		.replace(
			/<meta\s+name="twitter:url"\s+content="[^"]*"/,
			`<meta name="twitter:url" content="${pageUrl}"`,
		)
		.replace(
			/<link\s+rel="canonical"\s+href="[^"]*"/,
			`<link rel="canonical" href="${pageUrl}"`,
		);
}
