import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import type { PagesFunction } from "@cloudflare/workers-types";

interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
	createdAt: string;
	tags: string | null;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 1) + "…";
}

export const onRequest: PagesFunction<{
	SERVER_URL: string;
}> = async (context) => {
	const { id } = context.params;

	// Get the blog post data from the API
	const serverUrl = context.env.SERVER_URL || "https://api.burio16.com";

	try {
		// Fetch Japanese font for proper rendering
		const fontData = await fetch(
			"https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-700-normal.woff",
		).then((res) => res.arrayBuffer());

		// Fetch blog post data from the tRPC API
		const response = await fetch(
			`${serverUrl}/trpc/blog.getById?input=${encodeURIComponent(JSON.stringify({ id: Number(id) }))}`,
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch blog post: ${response.statusText}`);
		}

		const data = await response.json();
		const post: BlogPost = data.result.data;

		if (!post) {
			return new Response("Blog post not found", { status: 404 });
		}

		// Parse tags
		const tags: string[] = post.tags ? JSON.parse(post.tags) : [];

		// Format date
		const date = new Date(post.createdAt).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		// Truncate title and excerpt to prevent overflow
		const title = truncateText(post.title, 50);
		const excerpt = post.excerpt ? truncateText(post.excerpt, 80) : null;

		return new ImageResponse(
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					height: "100%",
					backgroundColor: "#0a0a0a",
					padding: "80px",
					fontFamily: "'Noto Sans JP', system-ui, sans-serif",
				}}
			>
				{/* Header */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
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
					<div
						style={{
							fontSize: "24px",
							color: "#888888",
						}}
					>
						{date}
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
								color: "#888888",
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
										backgroundColor: "#1a1a1a",
										padding: "12px 24px",
										borderRadius: "8px",
										border: "1px solid #333333",
									}}
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Footer - gradient line */}
				<div
					style={{
						width: "100%",
						height: "8px",
						background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
						borderRadius: "4px",
					}}
				/>
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
	} catch (error) {
		console.error("Error generating OG image:", error);
		return new Response("Failed to generate OG image", { status: 500 });
	}
};
