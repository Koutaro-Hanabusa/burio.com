import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import {
	RiArrowLeftLine,
	RiCalendarLine,
	RiCheckLine,
	RiEyeLine,
	RiFileCopyLine,
	RiFileTextLine,
	RiShareLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { useTrackBlogPostView } from "@/features/blog/api/track-blog-post-view";
import { useRenderedMarkdown } from "@/features/blog/hooks/use-rendered-markdown";
import { useSharePost } from "@/features/blog/hooks/use-share-post";
import type { BlogPost } from "@/features/blog/types";
import { parseTagsFromJson } from "@/features/blog/utils/parse-tags";
import { countContentChars } from "@/utils/count-content-chars";
import { formatDate } from "@/utils/date";

type BlogPostViewProps = {
	post: BlogPost;
};

export const BlogPostView = ({ post }: BlogPostViewProps) => {
	const { htmlContent, contentRef } = useRenderedMarkdown(post.content);
	const { copied, handleShare, handleCopyLink } = useSharePost(post);
	const trackView = useTrackBlogPostView();

	// biome-ignore lint/correctness/useExhaustiveDependencies: track once per post id
	useEffect(() => {
		trackView.mutate({ id: post.id });
	}, [post.id]);

	const postTags = useMemo(() => parseTagsFromJson(post.tags), [post.tags]);

	return (
		<>
			<motion.article initial={false} animate={{ opacity: 1, y: 0 }}>
				<div className="mx-auto max-w-4xl">
					<motion.div initial={false} animate={{ opacity: 1, x: 0 }}>
						<Button variant="ghost" className="mb-6" asChild>
							<Link to="/blog">
								<RiArrowLeftLine className="mr-2 h-4 w-4" />
								ブログ一覧
							</Link>
						</Button>
					</motion.div>

					<motion.header
						className="mb-8"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
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
								<RiFileTextLine className="h-4 w-4" />
								<span>{countContentChars(post.content)} 文字</span>
							</div>
							{post.views != null && post.views > 0 && (
								<div className="flex items-center gap-1">
									<RiEyeLine className="h-4 w-4" />
									<span>{post.views} views</span>
								</div>
							)}
						</div>

						{postTags.length > 0 && (
							<div className="mb-6 flex flex-wrap gap-2">
								{postTags.map((tag) => (
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
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
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
						initial={false}
						animate={{ opacity: 1, y: 0 }}
					>
						<div
							ref={contentRef}
							dangerouslySetInnerHTML={{ __html: htmlContent }}
							className="prose-h1:mt-8 prose-h2:mt-6 prose-h3:mt-4 prose-h1:mb-4 prose-h2:mb-3 prose-h3:mb-2 prose-li:mb-2 prose-p:mb-4 prose-ol:list-decimal prose-ul:list-disc prose-code:rounded-md prose-img:rounded-lg prose-pre:border prose-blockquote:border-primary prose-hr:border-border prose-pre:border-border prose-blockquote:border-l-4 prose-code:bg-accent/20 prose-pre:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-blockquote:pl-4 prose-ol:pl-6 prose-ul:pl-6 prose-headings:font-bold prose-a:text-primary prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-blockquote:italic prose-p:leading-relaxed prose-a:underline-offset-4 prose-img:shadow-lg prose-code:before:content-none prose-code:after:content-none hover:prose-a:text-primary/80"
						/>
					</motion.div>

					<motion.footer
						className="mt-12 border-border border-t pt-8"
						initial={false}
						animate={{ opacity: 1 }}
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
		</>
	);
};
