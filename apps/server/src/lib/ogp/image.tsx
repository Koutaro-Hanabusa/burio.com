import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import type { BlogPost } from "./types";
import { truncateText } from "./utils";

const FONT_URL =
	"https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-700-normal.woff";

interface OgImageProps {
	post: BlogPost;
	bgImageUrl: string;
}

function OgImageContent({ post, bgImageUrl }: OgImageProps) {
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
				src={bgImageUrl}
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

export async function generateOgImage(
	post: BlogPost,
	bgImageUrl: string,
): Promise<Response> {
	try {
		// フォントと背景画像を並列で取得
		const [fontData, bgImageData] = await Promise.all([
			fetch(FONT_URL).then((res) => {
				if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
				return res.arrayBuffer();
			}),
			fetch(bgImageUrl).then(async (res) => {
				if (!res.ok) throw new Error(`BG image fetch failed: ${res.status}`);
				const buffer = await res.arrayBuffer();
				const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
				return `data:image/png;base64,${base64}`;
			}),
		]);

		const imageResponse = new ImageResponse(
			<OgImageContent post={post} bgImageUrl={bgImageData} />,
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
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	} catch (error) {
		console.error("generateOgImage error:", error);
		throw error;
	}
}
