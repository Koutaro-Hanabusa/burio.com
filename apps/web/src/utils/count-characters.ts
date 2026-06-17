/**
 * 記事本文の文字数（空白を除く）をラベル文字列で返す。
 * Markdown のリンク / 画像はカウント対象から除外する。
 * - 画像 `![alt](url)` は丸ごと除外
 * - リンク `[text](url)` はテキストのみカウントし URL を除外
 * - 裸の URL も除外
 */
export const countCharacters = (content?: string | null): string => {
	const text = (content ?? "")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/<https?:\/\/[^>]*>/g, "")
		.replace(/https?:\/\/\S+/g, "");
	const count = text.replace(/\s/g, "").length;
	return `${count.toLocaleString("ja-JP")} 文字`;
};
