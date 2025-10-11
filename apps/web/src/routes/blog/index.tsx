import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
	RiArrowRightLine,
	RiCalendarLine,
	RiEyeLine,
	RiSearchLine,
	RiTimeLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/blog/")({
	component: BlogListPage,
});

function BlogListPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data: posts, isLoading } = trpc.blog.getAll.useQuery({
		limit: 50,
		published: true,
	});

	const filteredPosts = useMemo(() => {
		if (!posts) return [];
		if (!searchQuery.trim()) return posts;

		const query = searchQuery.toLowerCase();
		return posts.filter(
			(post) =>
				post.title.toLowerCase().includes(query) ||
				post.excerpt?.toLowerCase().includes(query) ||
				(post.tags &&
					JSON.parse(post.tags).some((tag: string) =>
						tag.toLowerCase().includes(query),
					)),
		);
	}, [posts, searchQuery]);

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

	return (
		<main className="min-h-screen">
			<motion.div
				className="px-6 py-20 md:px-12 lg:px-24"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="max-w-4xl mx-auto">
					<motion.div
						className="mb-12 space-y-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.8 }}
					>
						<h1 className="text-5xl md:text-6xl font-bold">Blog</h1>
						<p className="text-xl text-muted-foreground">
							技術的な洞察、開発のヒント、そして私の考えを共有します
						</p>

						<div className="relative">
							<RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="記事を検索..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</motion.div>

					{isLoading ? (
						<div className="space-y-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="p-6 rounded-lg border space-y-4">
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
									<div className="flex gap-4">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-4 w-16" />
									</div>
								</div>
							))}
						</div>
					) : filteredPosts.length === 0 ? (
						<motion.div
							className="text-center py-16 space-y-6"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							<div className="text-6xl">📝</div>
							{searchQuery ? (
								<>
									<h2 className="text-2xl font-semibold">
										記事が見つかりませんでした
									</h2>
									<p className="text-muted-foreground text-lg max-w-md mx-auto">
										「{searchQuery}」に一致する記事がありませんでした。
										<br />
										別のキーワードで検索してみてください。
									</p>
									<Button
										variant="outline"
										onClick={() => setSearchQuery("")}
										className="mt-4"
									>
										検索をクリア
									</Button>
								</>
							) : (
								<>
									<h2 className="text-2xl font-semibold">
										記事はまだありません
									</h2>
									<p className="text-muted-foreground text-lg max-w-md mx-auto">
										現在ブログ記事を準備中です。
										<br />
										近日中に技術記事や開発に関する投稿をお届けします。
									</p>
									<div className="flex gap-4 justify-center mt-6">
										<Button asChild variant="outline">
											<Link to="/">ホームに戻る</Link>
										</Button>
										<Button asChild>
											<Link to="/contact">お問い合わせ</Link>
										</Button>
									</div>
								</>
							)}
						</motion.div>
					) : (
						<div className="space-y-6">
							{filteredPosts.map((post, index) => (
								<motion.article
									key={post.id}
									className="group p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1, duration: 0.6 }}
									whileHover={{
										y: -4,
										boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
									}}
								>
									<Link to={`/blog/${post.slug}`} className="block">
										{post.coverImage && (
											<div className="mb-4 rounded-lg overflow-hidden">
												<img
													src={post.coverImage}
													alt={post.title}
													className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
												/>
											</div>
										)}

										<h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
											{post.title}
										</h2>

										{post.excerpt && (
											<p className="text-muted-foreground mb-4 line-clamp-2">
												{post.excerpt}
											</p>
										)}

										<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
											<div className="flex items-center gap-1">
												<RiCalendarLine className="h-3.5 w-3.5" />
												<time>{formatDate(post.createdAt)}</time>
											</div>
											<div className="flex items-center gap-1">
												<RiTimeLine className="h-3.5 w-3.5" />
												<span>{calculateReadTime(post.content || "")}</span>
											</div>
											{post.views > 0 && (
												<div className="flex items-center gap-1">
													<RiEyeLine className="h-3.5 w-3.5" />
													<span>{post.views} views</span>
												</div>
											)}
										</div>

										{post.tags && JSON.parse(post.tags).length > 0 && (
											<div className="flex flex-wrap gap-2 mb-4">
												{JSON.parse(post.tags).map((tag: string) => (
													<span
														key={tag}
														className="px-2.5 py-0.5 text-xs rounded-full bg-accent/20 text-accent-foreground"
													>
														{tag}
													</span>
												))}
											</div>
										)}

										<div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
											<span>続きを読む</span>
											<RiArrowRightLine className="h-4 w-4 ml-1" />
										</div>
									</Link>
								</motion.article>
							))}
						</div>
					)}
				</div>
			</motion.div>
		</main>
	);
}
