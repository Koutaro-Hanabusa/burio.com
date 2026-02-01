import type { BlogPost } from "./types";
import { escapeHtml, truncateText } from "./utils";

export function injectOGPMetaTags(
	html: string,
	post: BlogPost,
	pageUrl: string,
	ogImageUrl: string,
): string {
	const title = escapeHtml(truncateText(post.title, 60));
	const description = escapeHtml(truncateText(post.excerpt || "", 160));
	const fullTitle = `${title} | burio16.com`;

	return html
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
