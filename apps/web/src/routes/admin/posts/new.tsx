import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useId, useState } from "react";
import { RiArrowLeftLine, RiMarkdownLine, RiSaveLine } from "react-icons/ri";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/admin/posts/new")({
	component: NewPostPage,
});

function NewPostPage() {
	const navigate = useNavigate();
	const titleId = useId();
	const excerptId = useId();
	const coverImageId = useId();
	const tagsId = useId();
	const [formData, setFormData] = useState({
		title: "",
		content: "",
		excerpt: "",
		coverImage: "",
		tags: "",
		published: false,
	});

	const createPostMutation = trpc.blog.create.useMutation({
		onSuccess: (_data) => {
			toast.success("記事が作成されました！");
			navigate({ to: `/admin/posts` });
		},
		onError: (error) => {
			toast.error(`エラー: ${error.message}`);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error("タイトルは必須です");
			return;
		}

		const tagsArray = formData.tags
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);

		createPostMutation.mutate({
			title: formData.title,
			content: formData.content,
			excerpt: formData.excerpt || undefined,
			coverImage: formData.coverImage || undefined,
			tags: tagsArray.length > 0 ? tagsArray : undefined,
			published: formData.published,
		});
	};

	const handleInputChange = (
		field: keyof typeof formData,
		value: string | boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\\s-]/g, "")
			.replace(/\\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
	};

	const previewTags = formData.tags
		.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);

	return (
		<main className="min-h-screen bg-background">
			<motion.div
				className="px-6 py-12 md:px-12 lg:px-24"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="max-w-4xl mx-auto">
					<motion.div
						className="mb-8 flex items-center justify-between"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.8 }}
					>
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate({ to: "/admin/posts" })}
							>
								<RiArrowLeftLine className="h-4 w-4 mr-2" />
								戻る
							</Button>
							<div>
								<h1 className="text-3xl md:text-4xl font-bold">新規記事作成</h1>
								<p className="text-muted-foreground">
									新しいブログ記事を作成します
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								checked={formData.published}
								onCheckedChange={(checked) =>
									handleInputChange("published", checked)
								}
							/>
							<Label>公開</Label>
						</div>
					</motion.div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.8 }}
						>
							<Card>
								<CardHeader>
									<CardTitle>基本情報</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor={titleId}>タイトル *</Label>
										<Input
											id={titleId}
											value={formData.title}
											onChange={(e) =>
												handleInputChange("title", e.target.value)
											}
											placeholder="記事のタイトルを入力..."
											required
										/>
										{formData.title && (
											<p className="text-sm text-muted-foreground mt-1">
												スラッグ: {generateSlug(formData.title)}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor={excerptId}>概要</Label>
										<Textarea
											id={excerptId}
											value={formData.excerpt}
											onChange={(e) =>
												handleInputChange("excerpt", e.target.value)
											}
											placeholder="記事の概要を入力..."
											rows={3}
										/>
									</div>

									<div>
										<Label htmlFor={coverImageId}>カバー画像URL</Label>
										<Input
											id={coverImageId}
											value={formData.coverImage}
											onChange={(e) =>
												handleInputChange("coverImage", e.target.value)
											}
											placeholder="https://example.com/image.jpg"
											type="url"
										/>
									</div>

									<div>
										<Label htmlFor={tagsId}>タグ</Label>
										<Input
											id={tagsId}
											value={formData.tags}
											onChange={(e) =>
												handleInputChange("tags", e.target.value)
											}
											placeholder="タグをカンマ区切りで入力... (例: React, JavaScript, Web)"
										/>
										{previewTags.length > 0 && (
											<div className="flex flex-wrap gap-2 mt-2">
												{previewTags.map((tag) => (
													<Badge key={tag} variant="secondary">
														{tag}
													</Badge>
												))}
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.8 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<RiMarkdownLine className="h-5 w-5" />
										記事コンテンツ
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Tabs defaultValue="edit" className="w-full">
										<TabsList className="grid w-full grid-cols-2">
											<TabsTrigger value="edit">編集</TabsTrigger>
											<TabsTrigger value="preview">プレビュー</TabsTrigger>
										</TabsList>
										<TabsContent value="edit" className="mt-4">
											<Textarea
												value={formData.content}
												onChange={(e) =>
													handleInputChange("content", e.target.value)
												}
												placeholder="# 記事タイトル

記事の内容をMarkdown形式で入力してください...

## セクション1

コンテンツ..."
												rows={20}
												className="font-mono text-sm"
											/>
											<p className="text-sm text-muted-foreground mt-2">
												Markdown記法をサポートしています。見出し、リスト、コードブロックなどが使用できます。
											</p>
										</TabsContent>
										<TabsContent value="preview" className="mt-4">
											<div className="p-4 border border-border rounded-lg bg-card min-h-[400px]">
												{formData.content ? (
													<div className="prose prose-gray max-w-none">
														<pre className="whitespace-pre-wrap">
															{formData.content}
														</pre>
													</div>
												) : (
													<p className="text-muted-foreground">
														コンテンツを入力するとプレビューが表示されます
													</p>
												)}
											</div>
										</TabsContent>
									</Tabs>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							className="flex gap-4 justify-end"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 0.8 }}
						>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate({ to: "/admin/posts" })}
							>
								キャンセル
							</Button>
							<Button
								type="submit"
								disabled={createPostMutation.isPending}
								className="min-w-[120px]"
							>
								{createPostMutation.isPending ? (
									"作成中..."
								) : (
									<>
										<RiSaveLine className="h-4 w-4 mr-2" />
										{formData.published ? "公開" : "下書き保存"}
									</>
								)}
							</Button>
						</motion.div>
					</form>
				</div>
			</motion.div>
		</main>
	);
}
