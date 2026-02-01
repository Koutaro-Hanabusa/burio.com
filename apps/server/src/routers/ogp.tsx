import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import type { Context } from "hono";
import { Hono } from "hono";

interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
	createdAt: string;
	tags: string | null;
	published: number;
}

interface Env {
	R2_PUBLIC_URL: string;
	PAGES_URL: string;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 1)}…`;
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
 * Inject OGP meta tags into HTML for blog posts
 */
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

const ogp = new Hono<{ Bindings: Env }>();

ogp.get("/blog/:id.png", async (c: Context<{ Bindings: Env }>) => {
	const id = c.req.param("id");
	const r2PublicUrl = c.env.R2_PUBLIC_URL;
	const bgImageUrl = `${r2PublicUrl}/burio.com_ogp.png`;

	try {
		// Fetch Japanese font for proper rendering
		const fontData = await fetch(
			"https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-700-normal.woff",
		).then((res) => res.arrayBuffer());

		// Fetch blog post data from tRPC API (same server)
		const baseUrl = new URL(c.req.url).origin;
		const response = await fetch(
			`${baseUrl}/trpc/blog.getById?input=${encodeURIComponent(JSON.stringify({ id: Number(id) }))}`,
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch blog post: ${response.statusText}`);
		}

		const data = (await response.json()) as { result: { data: BlogPost } };
		const post: BlogPost = data.result.data;

		if (!post) {
			return c.text("Blog post not found", 404);
		}

		// Parse tags
		const tags: string[] = post.tags ? JSON.parse(post.tags) : [];

		// Truncate title and excerpt to prevent overflow
		const title = truncateText(post.title, 50);
		const excerpt = post.excerpt ? truncateText(post.excerpt, 80) : null;

		const imageResponse = new ImageResponse(
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: "1200px",
					height: "630px",
					fontFamily: "'Noto Sans JP', system-ui, sans-serif",
					position: "relative",
				}}
			>
				{/* 背景画像 */}
				<img
					src={bgImageUrl}
					alt=""
					width={1200}
					height={630}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
					}}
				/>
				{/* 半透明オーバーレイ */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "1200px",
						height: "630px",
						backgroundColor: "rgba(0, 0, 0, 0.6)",
					}}
				/>

				{/* コンテンツ（前面） */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						height: "100%",
						padding: "80px",
						position: "relative",
					}}
				>
					{/* Header */}
					<div
						style={{
							display: "flex",
							marginBottom: "60px",
						}}
					>
						<div
							style={{
								fontSize: "36px",
								fontWeight: "bold",
								color: "#ffffff",
							}}
						>
							burio16.com
						</div>
					</div>

					{/* Main content */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							flex: 1,
							justifyContent: "center",
						}}
					>
						{/* Title */}
						<h1
							style={{
								fontSize: "64px",
								fontWeight: "bold",
								color: "#ffffff",
								lineHeight: 1.2,
								marginBottom: "30px",
								maxWidth: "100%",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{title}
						</h1>

						{/* Excerpt */}
						{excerpt && (
							<p
								style={{
									fontSize: "32px",
									color: "#cccccc",
									lineHeight: 1.5,
									marginBottom: "40px",
									maxWidth: "100%",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{excerpt}
							</p>
						)}

						{/* Tags */}
						{tags.length > 0 && (
							<div
								style={{
									display: "flex",
									gap: "16px",
									flexWrap: "wrap",
								}}
							>
								{tags.slice(0, 3).map((tag) => (
									<span
										key={tag}
										style={{
											fontSize: "24px",
											color: "#ffffff",
											backgroundColor: "rgba(255, 255, 255, 0.2)",
											padding: "12px 24px",
											borderRadius: "8px",
											border: "1px solid rgba(255, 255, 255, 0.3)",
										}}
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{
						name: "Noto Sans JP",
						data: fontData,
						weight: 700,
						style: "normal",
					},
				],
			},
		);

		// Add cache control headers to prevent caching
		return new Response(imageResponse.body, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	} catch (error) {
		console.error("Error generating OG image:", error);
		return c.text("Failed to generate OG image", 500);
	}
});

// Blog page with injected OGP meta tags
ogp.get("/blog/:id", async (c: Context<{ Bindings: Env }>) => {
	const id = c.req.param("id");
	const pagesUrl = c.env.PAGES_URL;
	const apiUrl = new URL(c.req.url).origin;

	try {
		// Fetch blog post data
		const postResponse = await fetch(
			`${apiUrl}/trpc/blog.getById?input=${encodeURIComponent(JSON.stringify({ id: Number(id) }))}`,
		);

		if (!postResponse.ok) {
			// Pass through to Pages
			const pagesResponse = await fetch(`${pagesUrl}/blog/${id}`);
			return new Response(pagesResponse.body, {
				status: pagesResponse.status,
				headers: pagesResponse.headers,
			});
		}

		const data = (await postResponse.json()) as {
			result: { data: BlogPost | null };
		};
		const post = data.result?.data;

		// Fetch original HTML from Pages
		const htmlResponse = await fetch(`${pagesUrl}/blog/${id}`);
		const html = await htmlResponse.text();

		// If post doesn't exist or is not published, return original HTML
		if (!post || !post.published) {
			return new Response(html, {
				status: htmlResponse.status,
				headers: htmlResponse.headers,
			});
		}

		// Inject OGP meta tags
		const pageUrl = `https://burio16.com/blog/${post.id}`;
		const ogImageUrl = `${apiUrl}/ogp/blog/${post.id}.png`;
		const modifiedHtml = injectOGPMetaTags(html, post, pageUrl, ogImageUrl);

		// Return modified HTML
		const headers = new Headers();
		htmlResponse.headers.forEach((value, key) => {
			headers.set(key, value);
		});
		headers.set("Content-Type", "text/html; charset=utf-8");

		return new Response(modifiedHtml, {
			status: htmlResponse.status,
			headers,
		});
	} catch (error) {
		console.error("Error injecting OGP meta tags:", error);
		// On error, pass through to Pages
		const pagesResponse = await fetch(`${pagesUrl}/blog/${id}`);
		return new Response(pagesResponse.body, {
			status: pagesResponse.status,
			headers: pagesResponse.headers,
		});
	}
});

export { ogp };
