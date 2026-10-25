import { Link, action } from "@void/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { RiArrowLeftLine, RiEyeLine, RiSaveLine } from "react-icons/ri";
import { getValidationErrors } from "void/pages-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type BlogFormInitialData,
	type BlogFormValues,
	useBlogForm,
} from "@/features/blog/hooks/use-blog-form";
import { AdminBlogPreview } from "./AdminBlogPreview";

type AdminBlogFormProps = {
	mode: "new" | "edit";
	id?: number;
	initialData?: BlogFormInitialData;
	headingText: string;
};

export const AdminBlogForm = ({
	mode,
	id,
	initialData,
	headingText,
}: AdminBlogFormProps) => {
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const onSubmit = async (values: BlogFormValues) => {
		setSubmitError(null);
		setFieldErrors({});
		try {
			const result =
				mode === "new"
					? await action("/admin/blog/new", { data: values })
					: await action("/admin/blog/:id/edit", {
							params: { id: String(id) },
							data: values,
						});
			if (!result.ok) {
				const errors = getValidationErrors(result.error.body);
				if (errors) setFieldErrors(errors);
				else setSubmitError(result.error.message);
			}
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "記事の保存に失敗しました",
			);
		}
	};
	const {
		form,
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
	} = useBlogForm({ initialData, onSubmit });

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
					<Button variant="outline" onClick={handlePreview} type="button">
						<RiEyeLine className="mr-2 h-4 w-4" />
						{preview ? "編集" : "プレビュー"}
					</Button>
				</div>
			</div>

			{!preview ? (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (!form.state.isSubmitting) void form.handleSubmit();
					}}
					className="space-y-6"
				>
					{submitError && (
						<p role="alert" className="text-destructive">
							{submitError}
						</p>
					)}
					<form.Field name="title">
						{(field) => (
							<div>
								<Label htmlFor={titleId}>タイトル *</Label>
								<Input
									id={titleId}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									required
									placeholder="記事のタイトル"
								/>
								{fieldErrors.title && <p role="alert">{fieldErrors.title}</p>}
							</div>
						)}
					</form.Field>

					<form.Field name="excerpt">
						{(field) => (
							<div>
								<Label htmlFor={excerptId}>概要</Label>
								<Input
									id={excerptId}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="記事の概要（一覧ページに表示されます）"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="content">
						{(field) => (
							<div>
								<Label htmlFor={contentId}>本文（Markdown）</Label>
								<textarea
									id={contentId}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									className="h-96 w-full resize-y rounded-md border bg-background p-3 text-foreground"
									placeholder="Markdownで記事を書く... (画像をペーストまたはドラッグ&ドロップできます)"
									{...textareaProps}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="coverImage">
						{(field) => (
							<div>
								<Label htmlFor={coverImageId}>カバー画像URL</Label>
								<Input
									id={coverImageId}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="https://example.com/image.jpg"
									type="url"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="tags">
						{(field) => (
							<div>
								<Label htmlFor={tagsId}>タグ（カンマ区切り）</Label>
								<Input
									id={tagsId}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="React, TypeScript, Web開発"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="published">
						{(field) => (
							<div className="flex items-center gap-2">
								<input
									id={publishedId}
									type="checkbox"
									aria-label="公開する"
									checked={field.state.value}
									onChange={(e) => field.handleChange(e.target.checked)}
									onBlur={field.handleBlur}
									className="h-4 w-4"
								/>
								<Label htmlFor={publishedId} className="cursor-pointer">
									公開する
								</Label>
							</div>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isPending) => (
							<Button type="submit" disabled={isPending}>
								<RiSaveLine className="mr-2 h-4 w-4" />
								{isPending
									? "保存中..."
									: mode === "new"
										? "記事を作成"
										: "記事を更新"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			) : (
				<form.Subscribe selector={(s) => s.values}>
					{(values) => (
						<AdminBlogPreview
							title={values.title}
							excerpt={values.excerpt}
							coverImage={values.coverImage}
							htmlContent={htmlContent}
							tags={values.tags}
							previewRef={previewRef}
						/>
					)}
				</form.Subscribe>
			)}
		</motion.div>
	);
};
