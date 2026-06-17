import { useEffect, useRef, useState } from "react";
import { hydrateLinkPreviews } from "@/utils/link-preview";
import { renderMarkdownPreview } from "../utils/markdown-preview";

/**
 * Markdown 文字列を安全な HTML へ変換し、
 * レンダリング後に link preview を hydrate するための ref と HTML を返すフック。
 *
 * 使用側は返却された `contentRef` を表示先の要素に渡す。
 */
export const useRenderedMarkdown = (content: string | null | undefined) => {
	const [htmlContent, setHtmlContent] = useState("");
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (content) {
			setHtmlContent(renderMarkdownPreview(content));
		} else {
			setHtmlContent("");
		}
	}, [content]);

	useEffect(() => {
		if (htmlContent && contentRef.current) {
			void hydrateLinkPreviews(contentRef.current);
		}
	}, [htmlContent]);

	return { htmlContent, contentRef };
};
