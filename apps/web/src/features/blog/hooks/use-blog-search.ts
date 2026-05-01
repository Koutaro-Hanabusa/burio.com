import { useMemo, useState } from "react";
import { filterPostsByQuery } from "../utils/filter-posts";

type SearchablePost = {
	title: string;
	excerpt?: string | null;
	tags?: string | null;
};

/**
 * ブログ一覧用の検索 state とフィルタ済み配列を提供するフック。
 * - 検索文字列の保持・クリア
 * - title / excerpt / tags へのマッチによる絞り込み
 */
export const useBlogSearch = <T extends SearchablePost>(
	posts: readonly T[],
) => {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredPosts = useMemo(
		() => filterPostsByQuery(posts, searchQuery),
		[posts, searchQuery],
	);

	const clearSearch = () => setSearchQuery("");

	return {
		searchQuery,
		setSearchQuery,
		clearSearch,
		filteredPosts,
	};
};
