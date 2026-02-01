import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

interface Env {
	SERVER_URL: string;
	R2_PUBLIC_URL: string;
}

interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
	tags: string | null;
}

const FONT_URL =
	"https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-700-normal.woff";

function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 3)}...`;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
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

function OgImageContent({
	post,
	bgImageDataUrl,
}: {
	post: BlogPost;
	bgImageDataUrl: string;
}) {
	const title = truncateText(post.title, 50);
	const excerpt = post.excerpt ? truncateText(post.excerpt, 80) : null;
	const tags: string[] = post.tags ? JSON.parse(post.tags) : [];

	return (
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
			<img
				src={bgImageDataUrl}
				alt=""
				width={1200}
				height={630}
				style={{ position: "absolute", top: 0, left: 0 }}
			/>
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
				<div style={{ display: "flex", marginBottom: "60px" }}>
					<div
						style={{ fontSize: "36px", fontWeight: "bold", color: "#ffffff" }}
					>
						burio16.com
					</div>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						justifyContent: "center",
					}}
				>
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
					{tags.length > 0 && (
						<div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
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
		</div>
	);
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const { params, env } = context;
	const id = params.id as string;

	const post = await fetchBlogPost(env.SERVER_URL, id);
	if (!post) {
		return new Response("Blog post not found", { status: 404 });
	}

	const bgImageUrl = `${env.R2_PUBLIC_URL}/burio.com_ogp.png`;

	try {
		const [fontData, bgImageBuffer] = await Promise.all([
			fetch(FONT_URL).then((res) => {
				if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
				return res.arrayBuffer();
			}),
			fetch(bgImageUrl).then((res) => {
				if (!res.ok)
					throw new Error(`Background image fetch failed: ${res.status}`);
				return res.arrayBuffer();
			}),
		]);

		const bgImageBase64 = arrayBufferToBase64(bgImageBuffer);
		const bgImageDataUrl = `data:image/png;base64,${bgImageBase64}`;

		const imageResponse = new ImageResponse(
			<OgImageContent post={post} bgImageDataUrl={bgImageDataUrl} />,
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

		return new Response(imageResponse.body, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=86400",
			},
		});
	} catch (error) {
		console.error("OG image generation error:", error);
		return new Response("Failed to generate OG image", { status: 500 });
	}
};
