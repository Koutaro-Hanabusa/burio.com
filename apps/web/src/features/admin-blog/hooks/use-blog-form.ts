import { useEffect, useId, useRef, useState } from "react";
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

/**
 * ブログ記事の作成・編集フォームで共通利用する state / 振る舞いをまとめたフック。
 * initialData が後から（非同期で）渡された場合にも内部 state を反映する。
 */
export function useBlogForm(initialData?: BlogFormInitialData) {
	const [title, setTitle] = useState(initialData?.title ?? "");
	const [content, setContent] = useState(initialData?.content ?? "");
	const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
	const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
	const [tags, setTags] = useState(initialData?.tags ?? "");
	const [published, setPublished] = useState(initialData?.published ?? false);
	const [preview, setPreview] = useState(false);
	const [htmlContent, setHtmlContent] = useState("");

	const { textareaProps } = useImageUpload(setContent);
	const previewRef = useRef<HTMLDivElement>(null);

	// フォーム要素用の一意な ID を生成
	const titleId = useId();
	const excerptId = useId();
	const contentId = useId();
	const coverImageId = useId();
	const tagsId = useId();
	const publishedId = useId();

	// initialData（編集対象記事）が後から取得された場合に state を反映する
	useEffect(() => {
		if (!initialData) return;
		setTitle(initialData.title);
		setContent(initialData.content);
		setExcerpt(initialData.excerpt);
		setCoverImage(initialData.coverImage);
		setTags(initialData.tags);
		setPublished(initialData.published);
	}, [initialData]);

	const handlePreview = () => {
		if (content) {
			setHtmlContent(renderMarkdownPreview(content));
		}
		setPreview((prev) => !prev);
	};

	// プレビュー切替後に link preview を hydrate する
	useEffect(() => {
		if (preview && htmlContent && previewRef.current) {
			hydrateLinkPreviews(previewRef.current);
		}
	}, [preview, htmlContent]);

	const getFormValues = (): BlogFormValues => ({
		title,
		content,
		excerpt,
		coverImage,
		tags: parseTagsInput(tags),
		published,
	});

	return {
		// state
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
		// refs / props
		previewRef,
		textareaProps,
		// IDs
		titleId,
		excerptId,
		contentId,
		coverImageId,
		tagsId,
		publishedId,
		// handlers
		handlePreview,
		getFormValues,
	};
}
