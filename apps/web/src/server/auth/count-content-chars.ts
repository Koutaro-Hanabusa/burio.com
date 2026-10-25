export const countContentChars = (content?: string | null): number => {
	if (!content) return 0;
	const stripped = content
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`[^`]*`/g, "")
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/https?:\/\/\S+/g, "");
	return stripped.length;
};
