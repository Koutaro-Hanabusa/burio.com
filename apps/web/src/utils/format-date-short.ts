/**
 * 日付を `YYYY/MM/DD` 形式（ja-JP, 2 桁ゼロ埋め）でフォーマットする。
 * 管理画面の一覧表示など、コンパクトな日付表記が必要な箇所で使用する。
 */
export const formatDateShort = (date: Date | string): string => {
	return new Date(date).toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
};
