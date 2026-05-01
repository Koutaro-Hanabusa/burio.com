/**
 * 記事の本文から想定読了時間（分）を算出してラベル文字列を返す。
 * - 1 分あたり 200 単語想定
 * - content が空 / undefined の場合は "1 min read" を返す
 */
export const calculateReadTime = (content?: string | null): string => {
	if (!content) return "1 min read";
	const wordsPerMinute = 200;
	const wordCount = content.split(/\s+/).length;
	const minutes = Math.ceil(wordCount / wordsPerMinute);
	return `${minutes} min read`;
};
