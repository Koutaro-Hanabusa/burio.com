import { createFileRoute, useNavigate } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { marked } from "marked";
import { useState } from "react";
import { RiArrowLeftLine, RiEyeLine, RiSaveLine } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/admin/blog/new")({
	component: NewBlogPost,
});

function NewBlogPost() {
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [coverImage, setCoverImage] = useState("");
	const [tags, setTags] = useState("");
	const [published, setPublished] = useState(false);
	const [preview, setPreview] = useState(false);
	const [htmlContent, setHtmlContent] = useState("");

	const createPost = trpc.blog.create.useMutation({
		onSuccess: (data) => {
			toast.success("記事を作成しました");
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

		createPost.mutate({
			title,
			content,
			excerpt,
			coverImage: coverImage || undefined,
			tags: tagArray.length > 0 ? tagArray : undefined,
			published,
		});
	};

	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<motion.div
				className="max-w-4xl mx-auto"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">新しい記事を作成</h1>
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
							<Button type="submit" disabled={createPost.isPending}>
								<RiSaveLine className="mr-2 h-4 w-4" />
								{createPost.isPending ? "保存中..." : "記事を作成"}
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
