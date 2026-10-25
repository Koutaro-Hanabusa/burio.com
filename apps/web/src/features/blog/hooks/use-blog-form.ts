import { useForm } from "@tanstack/react-form";
import type React from "react";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { renderMarkdownPreview } from "@/features/blog/utils/markdown-preview";
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

export type BlogFormValues = BlogFormInitialData;

const EMPTY_FIELDS: BlogFormValues = {
	title: "",
	content: "",
	excerpt: "",
	coverImage: "",
	tags: "",
	published: false,
};

type UseBlogFormParams = {
	initialData?: BlogFormInitialData;
	onSubmit: (values: BlogFormValues) => Promise<void>;
};

/**
 * ブログ記事の作成・編集フォームで共通利用するフォームインスタンス / 振る舞いをまとめたフック。
 * initialData が後から（非同期で）渡された場合にも内部 state を反映する。
 */
export function useBlogForm({ initialData, onSubmit }: UseBlogFormParams) {
	const form = useForm({
		defaultValues: initialData ?? EMPTY_FIELDS,
		onSubmit: async ({ value }) => onSubmit(value),
	});

	const [preview, setPreview] = useState(false);
	const [htmlContent, setHtmlContent] = useState("");
	const previewRef = useRef<HTMLDivElement>(null);

	const setContent = useCallback<React.Dispatch<React.SetStateAction<string>>>(
		(value) => {
			const current = form.getFieldValue("content");
			const next = typeof value === "function" ? value(current) : value;
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

	const initialTitle = initialData?.title;
	const initialContent = initialData?.content;
	const initialExcerpt = initialData?.excerpt;
	const initialCoverImage = initialData?.coverImage;
	const initialTags = initialData?.tags;
	const initialPublished = initialData?.published;
	const hasInitialData = initialData !== undefined;
	const resetValues = useMemo(
		() =>
			hasInitialData
				? {
						title: initialTitle ?? "",
						content: initialContent ?? "",
						excerpt: initialExcerpt ?? "",
						coverImage: initialCoverImage ?? "",
						tags: initialTags ?? "",
						published: initialPublished ?? false,
					}
				: null,
		[
			hasInitialData,
			initialTitle,
			initialContent,
			initialExcerpt,
			initialCoverImage,
			initialTags,
			initialPublished,
		],
	);
	useEffect(() => {
		if (resetValues) form.reset(resetValues);
	}, [form, resetValues]);

	const handlePreview = () => {
		const content = form.getFieldValue("content");
		if (content) {
			setHtmlContent(renderMarkdownPreview(content));
		}
		setPreview((prev) => !prev);
	};

	useEffect(() => {
		if (preview && htmlContent && previewRef.current) {
			void hydrateLinkPreviews(previewRef.current);
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
