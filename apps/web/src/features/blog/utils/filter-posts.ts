import { parseTagsFromJson } from "./parse-tags";

type FilterablePost = {
	title: string;
	excerpt?: string | null;
	tags?: string | null;
};

/**
 * 検索クエリを記事の title / excerpt / tags にマッチさせて絞り込む純関数。
 * - クエリは小文字化して部分一致
 * - 空文字 / 空白のみの場合は全件をそのまま返す
 */
export const filterPostsByQuery = <T extends FilterablePost>(
	posts: readonly T[],
	query: string,
): T[] => {
	const trimmed = query.trim();
	if (!trimmed) return [...posts];

	const lower = trimmed.toLowerCase();
	return posts.filter(
		(post) =>
			post.title.toLowerCase().includes(lower) ||
			post.excerpt?.toLowerCase().includes(lower) ||
			parseTagsFromJson(post.tags).some((tag) =>
				tag.toLowerCase().includes(lower),
			),
	);
};
