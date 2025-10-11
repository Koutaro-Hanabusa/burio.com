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
				<div className="max-w-6xl mx-auto">
					<motion.div
						className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.8 }}
					>
						<div>
							<h1 className="text-4xl md:text-5xl font-bold mb-2">記事管理</h1>
							<p className="text-muted-foreground">ブログ記事の管理と編集</p>
						</div>
						<Button asChild>
							<Link to="/admin/blog/new">
								<RiAddLine className="h-4 w-4 mr-2" />
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
							<RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="記事を検索..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 bg-background"
							/>
						</div>
					</motion.div>

					{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									className="p-6 bg-card rounded-lg border border-border"
								>
									<div className="flex justify-between items-start mb-4">
										<div className="flex-1">
											<Skeleton className="h-6 w-3/4 mb-2" />
											<Skeleton className="h-4 w-1/2 mb-2" />
											<Skeleton className="h-4 w-full" />
										</div>
										<div className="flex gap-2 ml-4">
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
									className="p-6 bg-card rounded-lg border border-border hover:shadow-md transition-all"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 + 0.4, duration: 0.6 }}
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-xl font-semibold">{post.title}</h3>
												<Badge
													variant={post.published ? "default" : "secondary"}
												>
													{post.published ? "公開" : "下書き"}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground mb-2">
												スラッグ: {post.slug}
											</p>
											{post.excerpt && (
												<p className="text-muted-foreground line-clamp-2 mb-3">
													{post.excerpt}
												</p>
											)}
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span>作成: {formatDate(post.createdAt)}</span>
												<span>更新: {formatDate(post.updatedAt)}</span>
												<span>👁️ {post.views} views</span>
											</div>
										</div>
										<div className="flex gap-2 ml-4">
											<Button variant="outline" size="sm" asChild>
												<Link to={`/blog/${post.slug}`} target="_blank">
													<RiEyeLine className="h-4 w-4" />
												</Link>
											</Button>
											<Button variant="outline" size="sm" asChild>
												<Link to={`/admin/blog/${post.id}/edit`}>
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
							className="text-center py-12 bg-card rounded-lg border border-border"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							<p className="text-muted-foreground text-lg mb-4">
								{searchQuery
									? "検索条件に一致する記事が見つかりません"
									: "まだ記事がありません"}
							</p>
							<Button asChild>
								<Link to="/admin/posts/new">
									<RiAddLine className="h-4 w-4 mr-2" />
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
