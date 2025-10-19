/**
 * Format a date to Japanese locale string
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., "2024年1月1日")
 */
export const formatDate = (date: Date | string): string => {
	return new Date(date).toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};
