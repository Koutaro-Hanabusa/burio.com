import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	RiAddLine,
	RiDeleteBinLine,
	RiEditLine,
	RiEyeLine,
	RiEyeOffLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/admin/blog/")({
	component: BlogAdmin,
});

function BlogAdmin() {
	const {
		data: posts,
		isLoading,
		refetch,
	} = trpc.blog.getAll.useQuery({
		limit: 100,
	});

	const deletePost = trpc.blog.delete.useMutation({
		onSuccess: () => {
			console.log("Delete successful");
			toast.success("記事を削除しました");
			refetch();
		},
		onError: (error) => {
			console.error("Delete error:", error);
			toast.error(`エラー: ${error.message}`);
		},
	});

	const togglePublish = trpc.blog.update.useMutation({
		onSuccess: () => {
			toast.success("公開状態を更新しました");
			refetch();
		},
		onError: (error) => {
			toast.error(`エラー: ${error.message}`);
		},
	});

	const handleDelete = (id: string, title: string) => {
		console.log(`Attempting to delete post: ${id} - ${title}`);
		if (confirm(`「${title}」を削除してよろしいですか？`)) {
			console.log(`User confirmed deletion for: ${id}`);
			deletePost.mutate({ id });
		} else {
			console.log(`User cancelled deletion for: ${id}`);
		}
	};

	const handleTogglePublish = (id: string, currentStatus: boolean) => {
		togglePublish.mutate({
			id,
			published: !currentStatus,
		});
	};

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	};

	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<motion.div
				className="max-w-6xl mx-auto"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">ブログ管理</h1>
					<Button asChild>
						<Link to="/admin/blog/new">
							<RiAddLine className="mr-2 h-4 w-4" />
							新しい記事
						</Link>
					</Button>
				</div>

				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="p-4 border rounded-lg">
								<Skeleton className="h-6 w-3/4 mb-2" />
								<Skeleton className="h-4 w-1/2" />
							</div>
						))}
					</div>
				) : posts && posts.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b">
									<th className="text-left p-4">タイトル</th>
									<th className="text-left p-4">スラッグ</th>
									<th className="text-center p-4">公開</th>
									<th className="text-center p-4">閲覧数</th>
									<th className="text-left p-4">作成日</th>
									<th className="text-center p-4">操作</th>
								</tr>
							</thead>
							<tbody>
								{posts.map((post) => (
									<motion.tr
										key={post.id}
										className="border-b hover:bg-accent/5"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.3 }}
									>
										<td className="p-4">
											<Link
												to={`/blog/${post.slug}`}
												className="font-medium hover:text-primary"
											>
												{post.title}
											</Link>
										</td>
										<td className="p-4 text-sm text-muted-foreground">
											{post.slug}
										</td>
										<td className="p-4 text-center">
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleTogglePublish(post.id, post.published)
												}
											>
												{post.published ? (
													<RiEyeLine className="h-4 w-4 text-green-600" />
												) : (
													<RiEyeOffLine className="h-4 w-4 text-gray-400" />
												)}
											</Button>
										</td>
										<td className="p-4 text-center">{post.views}</td>
										<td className="p-4 text-sm">
											{formatDate(post.createdAt)}
										</td>
										<td className="p-4">
											<div className="flex gap-2 justify-center">
												<Button variant="ghost" size="sm" asChild>
													<Link to={`/admin/blog/${post.id}/edit`}>
														<RiEditLine className="h-4 w-4" />
													</Link>
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(post.id, post.title)}
													className="text-destructive hover:text-destructive"
												>
													<RiDeleteBinLine className="h-4 w-4" />
												</Button>
											</div>
										</td>
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-muted-foreground mb-4">まだ記事がありません</p>
						<Button asChild>
							<Link to="/admin/blog/new">
								<RiAddLine className="mr-2 h-4 w-4" />
								最初の記事を作成
							</Link>
						</Button>
					</div>
				)}
			</motion.div>
		</main>
	);
}
