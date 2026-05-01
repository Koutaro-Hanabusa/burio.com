import { useForm } from "@tanstack/react-form";
import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { renderMarkdownPreview } from "@/features/blog/utils/markdown-preview";
import { parseTagsInput } from "@/features/blog/utils/parse-tags";
import { useImageUpload } from "@/hooks/use-image-upload";
import { hydrateLinkPreviews } from "@/utils/link-preview";

export type BlogFormInitialData = {
	title: string;
	content: string;
	excerpt: string;
	coverImage: string;
	tags: string;
	published: boolean;
};

export type BlogFormValues = {
	title: string;
	content: string;
	excerpt: string;
	coverImage: string;
	tags: string[];
	published: boolean;
};

type BlogFormFields = {
	title: string;
	content: string;
	excerpt: string;
	coverImage: string;
	tags: string;
	published: boolean;
};

const EMPTY_FIELDS: BlogFormFields = {
	title: "",
	content: "",
	excerpt: "",
	coverImage: "",
	tags: "",
	published: false,
};

type UseBlogFormParams = {
	initialData?: BlogFormInitialData;
	onSubmit: (values: BlogFormValues) => void;
};

/**
 * ブログ記事の作成・編集フォームで共通利用するフォームインスタンス / 振る舞いをまとめたフック。
 * initialData が後から（非同期で）渡された場合にも内部 state を反映する。
 */
export function useBlogForm({ initialData, onSubmit }: UseBlogFormParams) {
	const form = useForm({
		defaultValues: initialData ?? EMPTY_FIELDS,
		onSubmit: ({ value }) => {
			onSubmit({
				title: value.title,
				content: value.content,
				excerpt: value.excerpt,
				coverImage: value.coverImage,
				tags: parseTagsInput(value.tags),
				published: value.published,
			});
		},
	});

	const [preview, setPreview] = useState(false);
	const [htmlContent, setHtmlContent] = useState("");
	const previewRef = useRef<HTMLDivElement>(null);

	const setContent = useCallback<React.Dispatch<React.SetStateAction<string>>>(
		(value) => {
			const current = form.getFieldValue("content");
			const next =
				typeof value === "function"
					? (value as (prev: string) => string)(current)
					: value;
			form.setFieldValue("content", next);
		},
		[form],
	);

	const { textareaProps } = useImageUpload(setContent);

	const titleId = useId();
	const excerptId = useId();
	const contentId = useId();
	const coverImageId = useId();
	const tagsId = useId();
	const publishedId = useId();

	useEffect(() => {
		if (!initialData) return;
		form.reset(initialData);
	}, [initialData, form]);

	const handlePreview = () => {
		const content = form.getFieldValue("content");
		if (content) {
			setHtmlContent(renderMarkdownPreview(content));
		}
		setPreview((prev) => !prev);
	};

	useEffect(() => {
		if (preview && htmlContent && previewRef.current) {
			hydrateLinkPreviews(previewRef.current);
		}
	}, [preview, htmlContent]);

	return {
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
	};
}
