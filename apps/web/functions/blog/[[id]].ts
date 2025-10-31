/**
 * Cloudflare Pages Function for dynamic OGP meta tags injection
 *
 * This function intercepts requests to /blog/:id and injects
 * OGP meta tags into the HTML response for social media crawlers.
 */

interface Env {
	ASSETS: Fetcher;
}

const SERVER_URL = "https://burio-com-server.koutarouhanabusa.workers.dev";

export const onRequest: PagesFunction<Env> = async (context) => {
	const { params } = context;
	const id = (params as { id: string }).id;

	// Fetch blog post data from API
	let postTitle = "burio16.com";
	let postDescription = "burio16.comへようこそ";

	try {
		const response = await fetch(
			`${SERVER_URL}/trpc/blog.getById?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { id: Number(id) } }))}`,
		);

		if (response.ok) {
			const data = await response.json();
			if (data && data[0] && data[0].result && data[0].result.data) {
				const post = data[0].result.data;
				postTitle = post.title || postTitle;
				postDescription = post.excerpt || postDescription;
			}
		}
	} catch (error) {
		console.error("Failed to fetch blog post:", error);
	}

	// Fetch the original index.html
	const response = await context.env.ASSETS.fetch(
		context.request.url.replace(`/blog/${id}`, "/"),
	);
	let html = await response.text();

	// OGP meta tags to inject
	// Use the proxied image URL from the main domain for better Twitter compatibility
	const ogpImageUrl = `https://burio16.com/api/blog/${id}/og-image`;
	const pageUrl = `https://burio16.com/blog/${id}`;

	const metaTags = `
    <!-- Dynamic OGP Tags -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="burio16.com" />
    <meta property="og:title" content="${postTitle}" />
    <meta property="og:description" content="${postDescription}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:image" content="${ogpImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${postTitle} thumbnail" />
    <meta property="og:locale" content="ja_JP" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${postTitle}" />
    <meta name="twitter:description" content="${postDescription}" />
    <meta name="twitter:image" content="${ogpImageUrl}" />
    <meta name="twitter:image:alt" content="${postTitle} thumbnail" />
  `;

	// Inject meta tags into <head>
	html = html.replace("</head>", `${metaTags}\n  </head>`);

	// Also update the <title> tag
	html = html.replace(/<title>.*?<\/title>/, `<title>${postTitle}</title>`);

	return new Response(html, {
		headers: {
			"Content-Type": "text/html;charset=UTF-8",
		},
	});
};
