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
				<div className="mx-auto max-w-4xl">
					<motion.div
						className="mb-12 space-y-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.8 }}
					>
						<h1 className="font-bold text-5xl md:text-6xl">ぶりおの部屋</h1>
						<p className="text-medium text-muted-foreground">
							ルールル　ルルル　ルールル　ルルル　ルー↑ ルー↑↑　ルー↑↑↑
							　ルー↑↑↑↑ ルールルー↑
						</p>
						<p className="text-muted-foreground text-xl">
							サッカーの話、タコスの話、はたまた技術の話など幅広く思ったことを書いていきます。
						</p>

						<div className="relative">
							<RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
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
								<div key={i} className="space-y-4 rounded-lg border p-6">
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
							className="space-y-6 py-16 text-center"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							<div className="text-6xl">📝</div>
							{searchQuery ? (
								<>
									<h2 className="font-semibold text-2xl">
										記事が見つかりませんでした
									</h2>
									<p className="mx-auto max-w-md text-lg text-muted-foreground">
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
									<h2 className="font-semibold text-2xl">
										記事はまだありません
									</h2>
									<p className="mx-auto max-w-md text-lg text-muted-foreground">
										現在ブログ記事を準備中です。
										<br />
										近日中に技術記事や開発に関する投稿をお届けします。
									</p>
									<div className="mt-6 flex justify-center gap-4">
										<Button asChild variant="outline">
											<Link to="/">ホームに戻る</Link>
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
									className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1, duration: 0.6 }}
									whileHover={{
										y: -4,
										boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
									}}
								>
									<Link
										to="/blog/$id"
										params={{ id: String(post.id) }}
										className="block"
									>
										{post.coverImage && (
											<div className="mb-4 overflow-hidden rounded-lg">
												<img
													src={post.coverImage}
													alt={post.title}
													loading="lazy"
													decoding="async"
													className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
												/>
											</div>
										)}

										<h2 className="mb-3 font-semibold text-2xl transition-colors group-hover:text-primary">
											{post.title}
										</h2>

										{post.excerpt && (
											<p className="mb-4 line-clamp-2 text-muted-foreground">
												{post.excerpt}
											</p>
										)}

										<div className="mb-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
											<div className="flex items-center gap-1">
												<RiCalendarLine className="h-3.5 w-3.5" />
												<time>
													{post.createdAt ? formatDate(post.createdAt) : "N/A"}
												</time>
											</div>
											<div className="flex items-center gap-1">
												<RiTimeLine className="h-3.5 w-3.5" />
												<span>{calculateReadTime(post.content || "")}</span>
											</div>
											{post.views != null && post.views > 0 && (
												<div className="flex items-center gap-1">
													<RiEyeLine className="h-3.5 w-3.5" />
													<span>{post.views} views</span>
												</div>
											)}
										</div>

										{post.tags && JSON.parse(post.tags).length > 0 && (
											<div className="mb-4 flex flex-wrap gap-2">
												{JSON.parse(post.tags).map((tag: string) => (
													<span
														key={tag}
														className="rounded-full bg-accent/20 px-2.5 py-0.5 text-accent-foreground text-xs"
													>
														{tag}
													</span>
												))}
											</div>
										)}

										<div className="flex items-center font-medium text-primary transition-all group-hover:gap-2">
											<span>続きを読む</span>
											<RiArrowRightLine className="ml-1 h-4 w-4" />
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
