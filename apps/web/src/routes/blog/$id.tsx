import { createFileRoute, Link } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { marked } from "marked";
import { useEffect, useState } from "react";
import {
	RiArrowLeftLine,
	RiCalendarLine,
	RiCheckLine,
	RiEyeLine,
	RiFileCopyLine,
	RiShareLine,
	RiTimeLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/blog/$id")({
	component: BlogPostPage,
});

function BlogPostPage() {
	const { id } = Route.useParams();
	const { data: post, isLoading } = trpc.blog.getById.useQuery({
		id: Number(id),
	});
	const [copied, setCopied] = useState(false);
	const [htmlContent, setHtmlContent] = useState("");

	useEffect(() => {
		if (post?.content) {
			// Configure marked options
			marked.setOptions({
				gfm: true,
				breaks: true,
				pedantic: false,
			});

			// Parse markdown and sanitize HTML
			const rawHtml = marked(post.content) as string;
			const cleanHtml = DOMPurify.sanitize(rawHtml, {
				// 許可する属性を明示的に指定
				ADD_ATTR: ["target", "rel"],
				// 危険なタグを除去
				FORBID_TAGS: ["script", "object", "embed", "form", "input"],
				// 危険な属性を除去
				FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
				// 外部リンクを安全に
				ADD_URI_SAFE_ATTR: ["href", "src"],
			});
			setHtmlContent(cleanHtml);
		}
	}, [post?.content]);

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const calculateReadTime = (content?: string) => {
		if (!content) return "1 min read";
		const wordsPerMinute = 200;
		const wordCount = content.split(/\s+/).length;
		const minutes = Math.ceil(wordCount / wordsPerMinute);
		return `${minutes} min read`;
	};

	const handleShare = async () => {
		const url = window.location.href;

		if (navigator.share) {
			try {
				await navigator.share({
					title: post?.title,
					text: post?.excerpt || "",
					url,
				});
			} catch (err) {
				console.error("Share failed:", err);
			}
		} else {
			// Fallback: Copy to clipboard
			await handleCopyLink();
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			toast.success("リンクをコピーしました");
			setTimeout(() => setCopied(false), 2000);
		} catch (_err) {
			toast.error("コピーに失敗しました");
		}
	};

	if (isLoading) {
		return (
			<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
				<div className="mx-auto max-w-4xl">
					<Button variant="ghost" className="mb-6" disabled>
						<RiArrowLeftLine className="mr-2 h-4 w-4" />
						Back to Blog
					</Button>
					<div className="space-y-6">
						<Skeleton className="h-12 w-3/4" />
						<div className="flex gap-4">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-20" />
						</div>
						<Skeleton className="h-64 w-full" />
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
							<Skeleton className="h-4 w-4/6" />
						</div>
					</div>
				</div>
			</main>
		);
	}

	if (!post) {
		return (
			<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="mb-4 font-bold text-3xl">記事が見つかりません</h1>
					<p className="mb-6 text-muted-foreground">
						お探しの記事は存在しないか、削除された可能性があります。
					</p>
					<Button asChild>
						<Link to="/blog">ブログ一覧に戻る</Link>
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen">
			<motion.article
				className="px-6 py-20 md:px-12 lg:px-24"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="mx-auto max-w-4xl">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2, duration: 0.6 }}
					>
						<Button variant="ghost" className="mb-6" asChild>
							<Link to="/blog">
								<RiArrowLeftLine className="mr-2 h-4 w-4" />
								ブログ一覧
							</Link>
						</Button>
					</motion.div>

					<motion.header
						className="mb-8"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.6 }}
					>
						<h1 className="mb-6 font-bold text-4xl leading-tight md:text-5xl">
							{post.title}
						</h1>

						{post.excerpt && (
							<p className="mb-6 text-muted-foreground text-xl leading-relaxed">
								{post.excerpt}
							</p>
						)}

						<div className="mb-6 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
							<div className="flex items-center gap-1">
								<RiCalendarLine className="h-4 w-4" />
								<time>
									{post.createdAt ? formatDate(post.createdAt) : "N/A"}
								</time>
							</div>
							<div className="flex items-center gap-1">
								<RiTimeLine className="h-4 w-4" />
								<span>{calculateReadTime(post.content || "")}</span>
							</div>
							{post.views != null && post.views > 0 && (
								<div className="flex items-center gap-1">
									<RiEyeLine className="h-4 w-4" />
									<span>{post.views} views</span>
								</div>
							)}
						</div>

						{post.tags && JSON.parse(post.tags).length > 0 && (
							<div className="mb-6 flex flex-wrap gap-2">
								{JSON.parse(post.tags).map((tag: string) => (
									<span
										key={tag}
										className="rounded-full bg-accent/20 px-3 py-1 text-accent-foreground text-sm"
									>
										{tag}
									</span>
								))}
							</div>
						)}

						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={handleShare}>
								<RiShareLine className="mr-2 h-4 w-4" />
								シェア
							</Button>
							<Button variant="outline" size="sm" onClick={handleCopyLink}>
								{copied ? (
									<RiCheckLine className="mr-2 h-4 w-4" />
								) : (
									<RiFileCopyLine className="mr-2 h-4 w-4" />
								)}
								{copied ? "コピー済み" : "リンクをコピー"}
							</Button>
						</div>
					</motion.header>

					{post.coverImage && (
						<motion.div
							className="mb-8 overflow-hidden rounded-xl"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.4, duration: 0.6 }}
						>
							<img
								src={post.coverImage}
								alt={post.title}
								fetchPriority="high"
								decoding="async"
								className="h-auto w-full"
							/>
						</motion.div>
					)}

					<motion.div
						className="prose prose-lg dark:prose-invert max-w-none"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.6 }}
					>
						<div
							dangerouslySetInnerHTML={{ __html: htmlContent }}
							className="prose-h1:mt-8 prose-h2:mt-6 prose-h3:mt-4 prose-h1:mb-4 prose-h2:mb-3 prose-h3:mb-2 prose-li:mb-2 prose-p:mb-4 prose-ol:list-decimal prose-ul:list-disc prose-code:rounded-md prose-img:rounded-lg prose-pre:border prose-blockquote:border-primary prose-hr:border-border prose-pre:border-border prose-blockquote:border-l-4 prose-code:bg-accent/20 prose-pre:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-blockquote:pl-4 prose-ol:pl-6 prose-ul:pl-6 prose-headings:font-bold prose-a:text-primary prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-blockquote:italic prose-p:leading-relaxed prose-a:underline-offset-4 prose-img:shadow-lg prose-code:before:content-none prose-code:after:content-none hover:prose-a:text-primary/80"
						/>
					</motion.div>

					<motion.footer
						className="mt-12 border-border border-t pt-8"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6, duration: 0.6 }}
					>
						<div className="flex items-center justify-between">
							<Button variant="ghost" asChild>
								<Link to="/blog">
									<RiArrowLeftLine className="mr-2 h-4 w-4" />
									ブログ一覧に戻る
								</Link>
							</Button>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={handleShare}>
									<RiShareLine className="h-4 w-4" />
								</Button>
								<Button variant="outline" size="sm" onClick={handleCopyLink}>
									{copied ? (
										<RiCheckLine className="h-4 w-4" />
									) : (
										<RiFileCopyLine className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</motion.footer>
				</div>
			</motion.article>
		</main>
	);
}
