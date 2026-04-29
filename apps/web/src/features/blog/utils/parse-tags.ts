/**
 * フォーム入力（カンマ区切り文字列）をトリムされたタグ配列に変換する。
 * 余白のみ・空文字・null/undefined は空配列を返す。
 */
export function parseTagsInput(input: string | null | undefined): string[] {
	if (!input) return [];
	try {
		return input
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);
	} catch {
		return [];
	}
}

/**
 * DB に格納された tags（JSON 文字列 or null）を string[] 配列に変換する。
 * 公開側の表示・検索などで利用。パース失敗時や非配列は空配列を返す。
 */
export function parseTagsFromJson(
	jsonTags: string | null | undefined,
): string[] {
	if (!jsonTags) return [];
	try {
		const parsed = JSON.parse(jsonTags);
		if (Array.isArray(parsed)) {
			return parsed.filter((tag): tag is string => typeof tag === "string");
		}
		return [];
	} catch {
		return [];
	}
}

/**
 * DB に格納された tags（JSON 文字列 or null）をフォーム表示用の
 * カンマ区切り文字列に変換する。パース失敗時は空文字を返す。
 */
export function stringifyTagsForm(jsonTags: string | null | undefined): string {
	return parseTagsFromJson(jsonTags).join(", ");
}
