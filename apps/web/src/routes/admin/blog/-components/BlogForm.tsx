import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RiArrowLeftLine, RiEyeLine, RiSaveLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type BlogFormInitialData,
	type BlogFormValues,
	useBlogForm,
} from "@/features/admin-blog/hooks/use-blog-form";
import { BlogPreview } from "./BlogPreview";

type BlogFormProps = {
	mode: "new" | "edit";
	initialData?: BlogFormInitialData;
	onSubmit: (values: BlogFormValues) => void;
	isPending: boolean;
	headingText: string;
	submitLabel: string;
	submitPendingLabel: string;
};

export function BlogForm({
	initialData,
	onSubmit,
	isPending,
	headingText,
	submitLabel,
	submitPendingLabel,
}: BlogFormProps) {
	const navigate = useNavigate();
	const {
		title,
		setTitle,
		content,
		setContent,
		excerpt,
		setExcerpt,
		coverImage,
		setCoverImage,
		tags,
		setTags,
		published,
		setPublished,
		preview,
		htmlContent,
		previewRef,
		textareaProps,
		titleId,
		excerptId,
		contentId,
		coverImageId,
		tagsId,
		publishedId,
		handlePreview,
		getFormValues,
	} = useBlogForm(initialData);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(getFormValues());
	};

	return (
		<motion.div
			className="mx-auto max-w-4xl"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-bold text-3xl">{headingText}</h1>
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
						<Label htmlFor={titleId}>タイトル *</Label>
						<Input
							id={titleId}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							placeholder="記事のタイトル"
						/>
					</div>

					<div>
						<Label htmlFor={excerptId}>概要</Label>
						<Input
							id={excerptId}
							value={excerpt}
							onChange={(e) => setExcerpt(e.target.value)}
							placeholder="記事の概要（一覧ページに表示されます）"
						/>
					</div>

					<div>
						<Label htmlFor={contentId}>本文（Markdown）</Label>
						<textarea
							id={contentId}
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="h-96 w-full resize-y rounded-md border bg-background p-3 text-foreground"
							placeholder="Markdownで記事を書く... (画像をペーストまたはドラッグ&ドロップできます)"
							{...textareaProps}
						/>
					</div>

					<div>
						<Label htmlFor={coverImageId}>カバー画像URL</Label>
						<Input
							id={coverImageId}
							value={coverImage}
							onChange={(e) => setCoverImage(e.target.value)}
							placeholder="https://example.com/image.jpg"
							type="url"
						/>
					</div>

					<div>
						<Label htmlFor={tagsId}>タグ（カンマ区切り）</Label>
						<Input
							id={tagsId}
							value={tags}
							onChange={(e) => setTags(e.target.value)}
							placeholder="React, TypeScript, Web開発"
						/>
					</div>

					<div className="flex items-center gap-2">
						<input
							id={publishedId}
							type="checkbox"
							checked={published}
							onChange={(e) => setPublished(e.target.checked)}
							className="h-4 w-4"
						/>
						<Label htmlFor={publishedId} className="cursor-pointer">
							公開する
						</Label>
					</div>

					<div className="flex gap-4">
						<Button type="submit" disabled={isPending}>
							<RiSaveLine className="mr-2 h-4 w-4" />
							{isPending ? submitPendingLabel : submitLabel}
						</Button>
					</div>
				</form>
			) : (
				<BlogPreview
					title={title}
					excerpt={excerpt}
					coverImage={coverImage}
					htmlContent={htmlContent}
					tags={tags}
					previewRef={previewRef}
				/>
			)}
		</motion.div>
	);
}
