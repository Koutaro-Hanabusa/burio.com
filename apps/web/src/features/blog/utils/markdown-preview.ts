import DOMPurify from "dompurify";
import { marked } from "marked";
import { linkPreviewExtension } from "@/utils/link-preview";

/**
 * Markdown 文字列をプレビュー用の安全な HTML へ変換する。
 * - GFM / 改行を有効化
 * - linkPreviewExtension を適用
 * - DOMPurify でサニタイズ（プレビュー専用の制限を適用）
 *
 * admin プレビューと公開ページの両方で利用される共通実装。
 * `ADD_URI_SAFE_ATTR: ["href", "src"]` は公開側のセキュリティ要件に合わせて統一。
 */
export function renderMarkdownPreview(content: string): string {
	marked.setOptions({
		gfm: true,
		breaks: true,
		pedantic: false,
	});
	marked.use(linkPreviewExtension);
	const rawHtml = marked(content) as string;
	return DOMPurify.sanitize(rawHtml, {
		ADD_ATTR: ["data-url", "target", "rel"],
		ADD_URI_SAFE_ATTR: ["href", "src"],
		// プレビュー用の安全な設定
		FORBID_TAGS: ["script", "object", "embed", "form", "input"],
		FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
	});
}
