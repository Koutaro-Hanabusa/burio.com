import vercelOGPagesPlugin from "@cloudflare/pages-plugin-vercel-og";
import { z } from "zod";

interface Env {
	SERVER_URL: string;
	OGP_BASE_IMAGE_URL: string;
}

// Cloudflare Pages Function context type
interface EventContext<Env = unknown, P extends string = any, Data = unknown> {
	request: Request;
	env: Env;
	params: P;
	waitUntil: (promise: Promise<unknown>) => void;
	next: (input?: Request | string) => Promise<Response>;
	data: Data;
}

type PagesFunction<Env = unknown> = (
	context: EventContext<Env, any, Record<string, unknown>>,
) => Response | Promise<Response>;

interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
}

// Zodスキーマによる検証
const BlogPostSchema = z.object({
	id: z.number(),
	title: z.string(),
	excerpt: z.string().nullable(),
});

// HTMLエスケープ関数
const escapeHtml = (text: string): string => {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

// タイトルの長さに応じてフォントサイズを調整
const getTitleFontSize = (title: string): string => {
	if (title.length > 50) return "40px";
	if (title.length > 30) return "48px";
	return "56px";
};

// タイトルの切り詰め
const truncateTitle = (title: string, maxLength = 70): string => {
	return title.length > maxLength
		? `${title.substring(0, maxLength - 3)}...`
		: title;
};

async function fetchBlogPost(id: string, env: Env): Promise<BlogPost | null> {
	try {
		const serverUrl = env.SERVER_URL;
		if (!serverUrl) {
			console.error("SERVER_URL is not configured");
			return null;
		}

		const response = await fetch(
			`${serverUrl}/trpc/blog.getById?input=${encodeURIComponent(
				JSON.stringify({ id: Number(id) }),
			)}`,
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			console.error(
				`Failed to fetch blog post: ${response.status} ${response.statusText}`,
			);
			return null;
		}

		const data = await response.json();

		// Zodによる検証
		const result = BlogPostSchema.safeParse(data.result?.data);

		if (!result.success) {
			console.error("Invalid blog post data:", result.error);
			return null;
		}

		return result.data;
	} catch (error) {
		console.error("Error fetching blog post:", error);
		return null;
	}
}

// エラー表示用コンポーネント
const ErrorDisplay = ({
	message,
	detail,
}: {
	message: string;
	detail?: string;
}) => (
	<div
		style={{
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			width: "100%",
			height: "100%",
			backgroundColor: "#1a1a1a",
			color: "white",
			fontSize: "48px",
			fontFamily: "sans-serif",
			textAlign: "center",
			padding: "60px",
		}}
	>
		<div>
			<div style={{ fontSize: "72px", marginBottom: "20px" }}>⚠️</div>
			<div>{message}</div>
			{detail && (
				<div style={{ fontSize: "24px", marginTop: "20px", opacity: 0.7 }}>
					{detail}
				</div>
			)}
		</div>
	</div>
);

export const onRequest: PagesFunction<Env> = async (context) => {
	const ogHandler = vercelOGPagesPlugin<{ env: Env }>({
		imagePathSuffix: "/og-image",
		autoInject: {
			openGraph: true,
		},
		options: {
			width: 1200,
			height: 630,
		},
		component: async ({ pathname, env }) => {
			// Extract blog ID from pathname: /blog/:id or /blog/:id/
			const match = pathname.match(/\/blog\/(\d+)/);
			if (!match || !match[1]) {
				return <ErrorDisplay message="Invalid blog URL" />;
			}

			const blogId = match[1];
			const numericId = Number(blogId);

			// IDの範囲検証
			if (
				!Number.isInteger(numericId) ||
				numericId <= 0 ||
				numericId > Number.MAX_SAFE_INTEGER
			) {
				return (
					<ErrorDisplay message="Invalid blog ID" detail={`ID: ${blogId}`} />
				);
			}

			const post = await fetchBlogPost(blogId, env);

			if (!post) {
				return (
					<ErrorDisplay
						message="記事が見つかりません"
						detail={`Blog ID: ${blogId}`}
					/>
				);
			}

			// 背景画像URLを環境変数から取得
			const baseImageUrl =
				env.OGP_BASE_IMAGE_URL || "https://burio16.com/burio.com_ogp.png";

			// タイトルと抜粋をサニタイズ
			const safeTitle = escapeHtml(truncateTitle(post.title));
			const safeExcerpt = post.excerpt
				? escapeHtml(
						post.excerpt.length > 100
							? `${post.excerpt.substring(0, 97)}...`
							: post.excerpt,
					)
				: null;

			// Single parent JSX element to avoid Cloudflare runtime errors
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						height: "100%",
						backgroundImage: `url(${baseImageUrl})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						padding: "60px",
						fontFamily: "sans-serif",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							flex: 1,
							backgroundColor: "rgba(0, 0, 0, 0.6)",
							borderRadius: "20px",
							padding: "40px",
						}}
					>
						<div
							style={{
								fontSize: getTitleFontSize(post.title),
								fontWeight: "bold",
								color: "white",
								textAlign: "center",
								lineHeight: 1.2,
								maxWidth: "90%",
								textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
							}}
						>
							{safeTitle}
						</div>
						{safeExcerpt && (
							<div
								style={{
									fontSize: "28px",
									color: "#e0e0e0",
									textAlign: "center",
									marginTop: "20px",
									maxWidth: "85%",
									textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
								}}
							>
								{safeExcerpt}
							</div>
						)}
					</div>
				</div>
			);
		},
	});

	// Pass the env through the plugin's props
	return ogHandler({
		...context,
		data: { env: context.env },
	});
};
