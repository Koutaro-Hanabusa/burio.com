interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
	coverImage: string | null;
	published: number;
}

interface Env {
	SERVER_URL: string;
}

interface PagesContext {
	request: Request;
	env: Env;
	next: () => Promise<Response>;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 1)}…`;
}

/**
 * Inject OGP meta tags into HTML for blog posts
 */
function injectOGPMetaTags(
	html: string,
	post: BlogPost,
	baseUrl: string,
): string {
	const title = escapeHtml(truncate(post.title, 60));
	const description = escapeHtml(truncate(post.excerpt || "", 160));
	const pageUrl = `${baseUrl}/blog/${post.id}`;
	const ogImageUrl = `${baseUrl}/blog/${post.id}.png`;
	const fullTitle = `${title} | burio16.com`;

	return (
		html
			// Title tag
			.replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`)
			// Meta description
			.replace(
				/<meta\s+name="description"\s+content="[^"]*"/,
				`<meta name="description" content="${description}"`,
			)
			// Open Graph tags
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
			// Twitter Card tags
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
			// Canonical URL
			.replace(
				/<link\s+rel="canonical"\s+href="[^"]*"/,
				`<link rel="canonical" href="${pageUrl}"`,
			)
	);
}

export async function onRequest(context: PagesContext): Promise<Response> {
	const url = new URL(context.request.url);
	const pathname = url.pathname;

	// Check if this is a blog post page (e.g., /blog/123)
	const blogMatch = pathname.match(/^\/blog\/(\d+)$/);

	if (!blogMatch) {
		// Not a blog post page, pass through
		return context.next();
	}

	const postId = blogMatch[1];
	const serverUrl = context.env.SERVER_URL || "https://api.burio16.com";
	const baseUrl = `${url.protocol}//${url.host}`;

	try {
		// Fetch blog post data from the tRPC API
		const response = await fetch(
			`${serverUrl}/trpc/blog.getById?input=${encodeURIComponent(JSON.stringify({ id: Number(postId) }))}`,
		);

		if (!response.ok) {
			// API error, pass through to default HTML
			return context.next();
		}

		const data = (await response.json()) as {
			result: { data: BlogPost | null };
		};
		const post = data.result?.data;

		// If post doesn't exist or is not published, pass through
		if (!post || !post.published) {
			return context.next();
		}

		// Get the original HTML response
		const originalResponse = await context.next();
		const html = await originalResponse.text();

		// Inject OGP meta tags
		const modifiedHtml = injectOGPMetaTags(html, post, baseUrl);

		// Return modified HTML with same headers
		const headers = new Headers();
		originalResponse.headers.forEach((value, key) => {
			headers.set(key, value);
		});

		return new Response(modifiedHtml, {
			status: originalResponse.status,
			headers,
		});
	} catch (error) {
		console.error("Error injecting OGP meta tags:", error);
		// On error, pass through to default HTML
		return context.next();
	}
}
