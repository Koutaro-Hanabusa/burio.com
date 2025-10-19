import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
	RiAddLine,
	RiDeleteBinLine,
	RiEditLine,
	RiEyeLine,
	RiSearchLine,
} from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/admin/posts/")({
	component: AdminPostsList,
});

function AdminPostsList() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data: posts, isLoading } = trpc.blog.getAll.useQuery({
		limit: 100,
		// 管理画面では公開・非公開関係なく全て表示
	});

	const filteredPosts = posts?.filter((post) => {
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase();
		return (
			post.title.toLowerCase().includes(query) ||
			post.slug.toLowerCase().includes(query) ||
			post.excerpt?.toLowerCase().includes(query)
		);
	});

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<main className="min-h-screen bg-background">
			<motion.div
				className="px-6 py-12 md:px-12 lg:px-24"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="mx-auto max-w-6xl">
					<motion.div
						className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.8 }}
					>
						<div>
							<h1 className="mb-2 font-bold text-4xl md:text-5xl">記事管理</h1>
							<p className="text-muted-foreground">ブログ記事の管理と編集</p>
						</div>
						<Button asChild>
							<Link to="/admin/blog/new">
								<RiAddLine className="mr-2 h-4 w-4" />
								新規作成
							</Link>
						</Button>
					</motion.div>

					<motion.div
						className="mb-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.8 }}
					>
						<div className="relative max-w-md">
							<RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								type="text"
								placeholder="記事を検索..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="bg-background pl-10"
							/>
						</div>
					</motion.div>

					{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									className="rounded-lg border border-border bg-card p-6"
								>
									<div className="mb-4 flex items-start justify-between">
										<div className="flex-1">
											<Skeleton className="mb-2 h-6 w-3/4" />
											<Skeleton className="mb-2 h-4 w-1/2" />
											<Skeleton className="h-4 w-full" />
										</div>
										<div className="ml-4 flex gap-2">
											<Skeleton className="h-8 w-20" />
											<Skeleton className="h-8 w-8" />
											<Skeleton className="h-8 w-8" />
											<Skeleton className="h-8 w-8" />
										</div>
									</div>
								</div>
							))}
						</div>
					) : filteredPosts && filteredPosts.length > 0 ? (
						<div className="space-y-4">
							{filteredPosts.map((post, index) => (
								<motion.div
									key={post.id}
									className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 + 0.4, duration: 0.6 }}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="mb-2 flex items-center gap-3">
												<h3 className="font-semibold text-xl">{post.title}</h3>
												<Badge
													variant={
														post.published === 1 ? "default" : "secondary"
													}
												>
													{post.published === 1 ? "公開" : "下書き"}
												</Badge>
											</div>
											<p className="mb-2 text-muted-foreground text-sm">
												スラッグ: {post.slug}
											</p>
											{post.excerpt && (
												<p className="mb-3 line-clamp-2 text-muted-foreground">
													{post.excerpt}
												</p>
											)}
											<div className="flex items-center gap-4 text-muted-foreground text-sm">
												<span>
													作成:{" "}
													{post.createdAt ? formatDate(post.createdAt) : "N/A"}
												</span>
												<span>
													更新:{" "}
													{post.updatedAt ? formatDate(post.updatedAt) : "N/A"}
												</span>
												<span>👁️ {post.views ?? 0} views</span>
											</div>
										</div>
										<div className="ml-4 flex gap-2">
											<Button variant="outline" size="sm" asChild>
												<Link
													to="/blog/$id"
													params={{ id: String(post.id) }}
													target="_blank"
												>
													<RiEyeLine className="h-4 w-4" />
												</Link>
											</Button>
											<Button variant="outline" size="sm" asChild>
												<Link
													to="/admin/blog/$id/edit"
													params={{ id: String(post.id) }}
												>
													<RiEditLine className="h-4 w-4" />
												</Link>
											</Button>
											<Button variant="destructive" size="sm">
												<RiDeleteBinLine className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					) : (
						<motion.div
							className="rounded-lg border border-border bg-card py-12 text-center"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							<p className="mb-4 text-lg text-muted-foreground">
								{searchQuery
									? "検索条件に一致する記事が見つかりません"
									: "まだ記事がありません"}
							</p>
							<Button asChild>
								<Link to="/admin/posts/new">
									<RiAddLine className="mr-2 h-4 w-4" />
									最初の記事を作成
								</Link>
							</Button>
						</motion.div>
					)}
				</div>
			</motion.div>
		</main>
	);
}
