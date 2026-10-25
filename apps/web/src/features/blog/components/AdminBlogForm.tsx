import { Form, Link, useForm } from "@void/react";
import { motion } from "framer-motion";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { RiArrowLeftLine, RiEyeLine, RiSaveLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageUpload } from "@/hooks/use-image-upload";
import { hydrateLinkPreviews } from "@/utils/link-preview";
import { renderMarkdownPreview } from "../utils/markdown-preview";
import { AdminBlogPreview } from "./AdminBlogPreview";

type Fields = {
	title: string;
	content: string;
	excerpt: string;
	coverImage: string;
	tags: string;
	published: boolean;
};

const empty: Fields = {
	title: "",
	content: "",
	excerpt: "",
	coverImage: "",
	tags: "",
	published: false,
};

export function AdminBlogForm({
	mode,
	id,
	initialData = empty,
	headingText,
}: {
	mode: "new" | "edit";
	id?: number;
	initialData?: Fields;
	headingText: string;
}) {
	const newForm = useForm("/admin/blog/new", initialData);
	const editForm = useForm("/admin/blog/:id/edit", initialData, {
		params: { id: String(id ?? "") },
	});
	const form = mode === "new" ? newForm : editForm;
	const contentRef = useRef(initialData.content);
	useEffect(() => {
		contentRef.current = initialData.content;
	}, [id, initialData.content]);
	const [preview, setPreview] = useState(false);
	const [htmlContent, setHtmlContent] = useState("");
	const previewRef = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const excerptId = useId();
	const contentId = useId();
	const coverImageId = useId();
	const tagsId = useId();
	const publishedId = useId();
	const setContent: React.Dispatch<React.SetStateAction<string>> = (value) => {
		const next =
			typeof value === "function" ? value(contentRef.current) : value;
		contentRef.current = next;
		form.setData("content", next);
	};
	const { textareaProps } = useImageUpload(setContent);

	useEffect(() => {
		if (preview && htmlContent && previewRef.current) {
			void hydrateLinkPreviews(previewRef.current);
		}
	}, [preview, htmlContent]);

	const togglePreview = () => {
		if (!preview) setHtmlContent(renderMarkdownPreview(form.data.content));
		setPreview(!preview);
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
					<Button variant="outline" asChild>
						<Link href="/admin/blog">
							<RiArrowLeftLine className="mr-2 h-4 w-4" />
							戻る
						</Link>
					</Button>
					<Button variant="outline" onClick={togglePreview} type="button">
						<RiEyeLine className="mr-2 h-4 w-4" />
						{preview ? "編集" : "プレビュー"}
					</Button>
				</div>
			</div>
			{preview ? (
				<AdminBlogPreview
					title={form.data.title}
					excerpt={form.data.excerpt}
					coverImage={form.data.coverImage}
					htmlContent={htmlContent}
					tags={form.data.tags}
					previewRef={previewRef}
				/>
			) : (
				<Form form={form} className="space-y-6">
					{form.error && (
						<p role="alert" className="text-destructive">
							{form.error.message}
						</p>
					)}
					<div>
						<Label htmlFor={titleId}>タイトル *</Label>
						<Input
							id={titleId}
							name="title"
							value={form.data.title}
							onChange={(e) => form.setData("title", e.target.value)}
							required
							placeholder="記事のタイトル"
						/>
						{form.errors.title && <p role="alert">{form.errors.title}</p>}
					</div>
					<div>
						<Label htmlFor={excerptId}>概要</Label>
						<Input
							id={excerptId}
							name="excerpt"
							value={form.data.excerpt}
							onChange={(e) => form.setData("excerpt", e.target.value)}
							placeholder="記事の概要（一覧ページに表示されます）"
						/>
					</div>
					<div>
						<Label htmlFor={contentId}>本文（Markdown）</Label>
						<textarea
							id={contentId}
							name="content"
							value={form.data.content}
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
							name="coverImage"
							value={form.data.coverImage}
							onChange={(e) => form.setData("coverImage", e.target.value)}
							placeholder="https://example.com/image.jpg"
							type="url"
						/>
					</div>
					<div>
						<Label htmlFor={tagsId}>タグ（カンマ区切り）</Label>
						<Input
							id={tagsId}
							name="tags"
							value={form.data.tags}
							onChange={(e) => form.setData("tags", e.target.value)}
							placeholder="React, TypeScript, Web開発"
						/>
					</div>
					<div className="flex items-center gap-2">
						<input
							id={publishedId}
							name="published"
							type="checkbox"
							aria-label="公開する"
							checked={form.data.published}
							onChange={(e) => form.setData("published", e.target.checked)}
							className="h-4 w-4"
						/>
						<Label htmlFor={publishedId} className="cursor-pointer">
							公開する
						</Label>
					</div>
					<Button type="submit" disabled={form.pending}>
						<RiSaveLine className="mr-2 h-4 w-4" />
						{form.pending
							? "保存中..."
							: mode === "new"
								? "記事を作成"
								: "記事を更新"}
					</Button>
				</Form>
			)}
		</motion.div>
	);
}
