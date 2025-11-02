import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import type { PagesFunction } from "@cloudflare/workers-types";

interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
	createdAt: string;
	tags: string | null;
}

export const onRequest: PagesFunction<{
	SERVER_URL: string;
}> = async (context) => {
	const { id } = context.params;

	// Get the blog post data from the API
	const serverUrl = context.env.SERVER_URL || "https://api.burio16.com";

	try {
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

		// Fetch the OGP template image and convert to base64
		const baseUrl = new URL(context.request.url).origin;
		const templateImageUrl = `${baseUrl}/burio.com_ogp.png`;

		const imageResponse = await fetch(templateImageUrl);
		const imageBuffer = await imageResponse.arrayBuffer();
		const base64Image = btoa(
			String.fromCharCode(...new Uint8Array(imageBuffer))
		);
		const dataUrl = `data:image/png;base64,${base64Image}`;

		return new ImageResponse(
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					height: "100%",
					backgroundImage: `url(${dataUrl})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					padding: "80px",
					fontFamily: "system-ui, sans-serif",
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
							textShadow: "0 2px 10px rgba(0,0,0,0.8)",
						}}
					>
						burio16.com
					</div>
					<div
						style={{
							fontSize: "24px",
							color: "#cccccc",
							textShadow: "0 2px 8px rgba(0,0,0,0.8)",
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
							textShadow: "0 4px 12px rgba(0,0,0,0.9)",
						}}
					>
						{post.title}
					</h1>

					{/* Excerpt */}
					{post.excerpt && (
						<p
							style={{
								fontSize: "32px",
								color: "#cccccc",
								lineHeight: 1.5,
								marginBottom: "40px",
								maxWidth: "100%",
								overflow: "hidden",
								textOverflow: "ellipsis",
								textShadow: "0 2px 10px rgba(0,0,0,0.8)",
							}}
						>
							{post.excerpt}
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
										backgroundColor: "rgba(26, 26, 26, 0.9)",
										padding: "12px 24px",
										borderRadius: "8px",
										border: "1px solid rgba(51, 51, 51, 0.8)",
										textShadow: "0 1px 4px rgba(0,0,0,0.5)",
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
			},
		);
	} catch (error) {
		console.error("Error generating OG image:", error);
		return new Response("Failed to generate OG image", { status: 500 });
	}
};
