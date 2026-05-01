import { Link } from "@tanstack/react-router";
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
import { useDeleteBlogPost } from "@/features/admin-blog/api/delete-blog-post";
import { useAdminBlogPosts } from "@/features/admin-blog/api/get-admin-blog-posts";
import { useTogglePublishBlogPost } from "@/features/admin-blog/api/toggle-publish-blog-post";
import { formatDateShort } from "@/utils/format-date-short";

export const BlogList = () => {
	const posts = useAdminBlogPosts();
	const deletePost = useDeleteBlogPost({
		mutationConfig: {
			onSuccess: () => {
				toast.success("記事を削除しました");
			},
			onError: (error) => {
				toast.error(`エラー: ${error.message}`);
			},
		},
	});
	const togglePublish = useTogglePublishBlogPost({
		mutationConfig: {
			onSuccess: () => {
				toast.success("公開状態を更新しました");
			},
			onError: (error) => {
				toast.error(`エラー: ${error.message}`);
			},
		},
	});

	const handleDelete = (id: number, title: string) => {
		if (confirm(`「${title}」を削除してよろしいですか？`)) {
			deletePost.mutate({ id });
		}
	};

	const handleTogglePublish = (id: number, currentStatus: boolean) => {
		togglePublish.mutate({ id, currentPublished: currentStatus });
	};

	return (
		<motion.div
			className="mx-auto max-w-6xl"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-bold text-3xl">ブログ管理</h1>
				<Button asChild>
					<Link to="/admin/blog/new">
						<RiAddLine className="mr-2 h-4 w-4" />
						新しい記事
					</Link>
				</Button>
			</div>

			{posts.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b">
								<th className="p-4 text-left">タイトル</th>
								<th className="p-4 text-left">スラッグ</th>
								<th className="p-4 text-center">公開</th>
								<th className="p-4 text-center">閲覧数</th>
								<th className="p-4 text-left">作成日</th>
								<th className="p-4 text-center">操作</th>
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
											to="/blog/$id"
											params={{ id: post.id }}
											className="font-medium hover:text-primary"
										>
											{post.title}
										</Link>
									</td>
									<td className="p-4 text-muted-foreground text-sm">
										{post.slug}
									</td>
									<td className="p-4 text-center">
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												handleTogglePublish(post.id, post.published === 1)
											}
										>
											{post.published === 1 ? (
												<RiEyeLine className="h-4 w-4 text-green-600" />
											) : (
												<RiEyeOffLine className="h-4 w-4 text-gray-400" />
											)}
										</Button>
									</td>
									<td className="p-4 text-center">{post.views ?? 0}</td>
									<td className="p-4 text-sm">
										{post.createdAt ? formatDateShort(post.createdAt) : "N/A"}
									</td>
									<td className="p-4">
										<div className="flex justify-center gap-2">
											<Button variant="ghost" size="sm" asChild>
												<Link
													to="/admin/blog/$id/edit"
													params={{ id: post.id }}
												>
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
				<div className="py-12 text-center">
					<p className="mb-4 text-muted-foreground">まだ記事がありません</p>
					<Button asChild>
						<Link to="/admin/blog/new">
							<RiAddLine className="mr-2 h-4 w-4" />
							最初の記事を作成
						</Link>
					</Button>
				</div>
			)}
		</motion.div>
	);
};
