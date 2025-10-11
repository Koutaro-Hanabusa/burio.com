import { createFileRoute, useNavigate } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { RiArrowLeftLine, RiEyeLine, RiSaveLine } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/admin/blog/$id/edit")({
	component: EditBlogPost,
});

function EditBlogPost() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [coverImage, setCoverImage] = useState("");
	const [tags, setTags] = useState("");
	const [published, setPublished] = useState(false);
	const [preview, setPreview] = useState(false);
	const [htmlContent, setHtmlContent] = useState("");

	// 既存記事データを取得
	const { data: posts, isLoading } = trpc.blog.getAll.useQuery({
		limit: 100,
	});

	const post = posts?.find((p) => p.id === id);

	useEffect(() => {
		if (post) {
			setTitle(post.title);
			setContent(post.content || "");
			setExcerpt(post.excerpt || "");
			setCoverImage(post.coverImage || "");
			setTags(post.tags ? JSON.parse(post.tags).join(", ") : "");
			setPublished(post.published);
		}
	}, [post]);

	const updatePost = trpc.blog.update.useMutation({
		onSuccess: (data) => {
			toast.success("記事を更新しました");
			navigate({ to: `/blog/${data.slug}` });
		},
		onError: (error) => {
			toast.error(`エラー: ${error.message}`);
		},
	});

	const handlePreview = () => {
		if (content) {
			marked.setOptions({
				gfm: true,
				breaks: true,
				pedantic: false,
			});
			const rawHtml = marked(content);
			const cleanHtml = DOMPurify.sanitize(rawHtml, {
				// プレビュー用の安全な設定
				FORBID_TAGS: ["script", "object", "embed", "form", "input"],
				FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
			});
			setHtmlContent(cleanHtml);
		}
		setPreview(!preview);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const tagArray = tags
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);

		updatePost.mutate({
			id,
			title,
			content,
			excerpt: excerpt || undefined,
			coverImage: coverImage || undefined,
			tags: tagArray.length > 0 ? tagArray : undefined,
			published,
		});
	};

	if (isLoading) {
		return (
			<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
				<div className="max-w-4xl mx-auto space-y-6">
					<Skeleton className="h-10 w-64" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-10 w-32" />
				</div>
			</main>
		);
	}

	if (!post) {
		return (
			<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-3xl font-bold mb-4">記事が見つかりません</h1>
					<Button onClick={() => navigate({ to: "/admin/blog" })}>
						管理画面に戻る
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<motion.div
				className="max-w-4xl mx-auto"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">記事を編集</h1>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => navigate({ to: "/admin/blog" })}
						>
							<RiArrowLeftLine className="mr-2 h-4 w-4" />
							戻る
						</Button>
						<Button variant="outline" onClick={handlePreview} type="button">
							<RiEyeLine className="mr-2 h-4 w-4" />
							{preview ? "編集" : "プレビュー"}
						</Button>
					</div>
				</div>

				{!preview ? (
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<Label htmlFor="title">タイトル *</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								placeholder="記事のタイトル"
							/>
						</div>

						<div>
							<Label htmlFor="excerpt">概要</Label>
							<Input
								id="excerpt"
								value={excerpt}
								onChange={(e) => setExcerpt(e.target.value)}
								placeholder="記事の概要（一覧ページに表示されます）"
							/>
						</div>

						<div>
							<Label htmlFor="content">本文（Markdown）</Label>
							<textarea
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								className="w-full h-96 p-3 border rounded-md bg-background text-foreground resize-y"
								placeholder="Markdownで記事を書く..."
							/>
						</div>

						<div>
							<Label htmlFor="coverImage">カバー画像URL</Label>
							<Input
								id="coverImage"
								value={coverImage}
								onChange={(e) => setCoverImage(e.target.value)}
								placeholder="https://example.com/image.jpg"
								type="url"
							/>
						</div>

						<div>
							<Label htmlFor="tags">タグ（カンマ区切り）</Label>
							<Input
								id="tags"
								value={tags}
								onChange={(e) => setTags(e.target.value)}
								placeholder="React, TypeScript, Web開発"
							/>
						</div>

						<div className="flex items-center gap-2">
							<input
								id="published"
								type="checkbox"
								checked={published}
								onChange={(e) => setPublished(e.target.checked)}
								className="h-4 w-4"
							/>
							<Label htmlFor="published" className="cursor-pointer">
								公開する
							</Label>
						</div>

						<div className="flex gap-4">
							<Button type="submit" disabled={updatePost.isPending}>
								<RiSaveLine className="mr-2 h-4 w-4" />
								{updatePost.isPending ? "更新中..." : "記事を更新"}
							</Button>
						</div>
					</form>
				) : (
					<div className="space-y-6">
						<div className="p-6 border rounded-lg bg-card">
							<h2 className="text-2xl font-bold mb-4">
								{title || "タイトル未設定"}
							</h2>
							{excerpt && (
								<p className="text-muted-foreground mb-4">{excerpt}</p>
							)}
							{coverImage && (
								<img
									src={coverImage}
									alt={title}
									className="w-full h-64 object-cover rounded-lg mb-6"
								/>
							)}
							<div
								className="prose prose-lg dark:prose-invert max-w-none"
								dangerouslySetInnerHTML={{ __html: htmlContent }}
							/>
							{tags && (
								<div className="flex flex-wrap gap-2 mt-6">
									{tags.split(",").map((tag, index) => (
										<span
											key={index}
											className="px-3 py-1 text-sm rounded-full bg-accent/20 text-accent-foreground"
										>
											{tag.trim()}
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</motion.div>
		</main>
	);
}
