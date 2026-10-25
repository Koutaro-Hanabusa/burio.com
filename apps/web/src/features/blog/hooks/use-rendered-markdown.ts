import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { hydrateLinkPreviews } from "@/utils/link-preview";
import { renderMarkdownPreview } from "../utils/markdown-preview";

const subscribeHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Markdown 文字列を安全な HTML へ変換し、
 * レンダリング後に link preview を hydrate するための ref と HTML を返すフック。
 *
 * 使用側は返却された `contentRef` を表示先の要素に渡す。
 */
export const useRenderedMarkdown = (content: string | null | undefined) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const isClient = useSyncExternalStore(
		subscribeHydration,
		getClientSnapshot,
		getServerSnapshot,
	);
	const htmlContent = useMemo(
		() => (isClient && content ? renderMarkdownPreview(content) : ""),
		[isClient, content],
	);

	useEffect(() => {
		if (htmlContent && contentRef.current) {
			void hydrateLinkPreviews(contentRef.current);
		}
	}, [htmlContent]);

	return { htmlContent, contentRef };
};
