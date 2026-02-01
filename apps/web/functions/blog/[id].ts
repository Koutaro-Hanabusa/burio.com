interface Env {
	ASSETS: Fetcher;
	SERVER_URL: string;
}

interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
	createdAt: string | null;
	tags: string | null;
	published: boolean;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 3)}...`;
}

function injectOGPMetaTags(
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

async function fetchBlogPost(
	serverUrl: string,
	id: string,
): Promise<BlogPost | null> {
	try {
		const response = await fetch(
			`${serverUrl}/trpc/blog.getById?input=${encodeURIComponent(JSON.stringify({ id: Number(id) }))}`,
		);
		if (!response.ok) return null;
		const data = (await response.json()) as { result: { data: BlogPost } };
		return data.result?.data ?? null;
	} catch {
		return null;
	}
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const { params, env, request } = context;
	const id = params.id as string;

	// OGP画像リクエストの場合はスキップ（別のfunctionで処理）
	if (request.url.endsWith("/og.png")) {
		return env.ASSETS.fetch(request);
	}

	// SPAのindex.htmlを取得
	const assetResponse = await env.ASSETS.fetch(
		new Request(new URL("/", request.url)),
	);
	const html = await assetResponse.text();

	// ブログ記事を取得
	const post = await fetchBlogPost(env.SERVER_URL, id);

	if (!post || !post.published) {
		// 記事がない場合はそのままSPAを返す
		return new Response(html, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	}

	// OGPメタタグを注入
	const pageUrl = `https://burio16.com/blog/${id}`;
	const ogImageUrl = `https://burio16.com/blog/${id}/og.png`;
	const modifiedHtml = injectOGPMetaTags(html, post, pageUrl, ogImageUrl);

	return new Response(modifiedHtml, {
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
};
