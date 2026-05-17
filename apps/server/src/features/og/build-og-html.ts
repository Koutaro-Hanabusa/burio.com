import { escapeHtml, truncateText } from "./utils";

interface BuildOgImageHtmlOptions {
	title: string;
	excerpt: string | null | undefined;
	tags: string[];
	bgImageDataUrl: string;
}

export function buildOgImageHtml({
	title,
	excerpt,
	tags,
	bgImageDataUrl,
}: BuildOgImageHtmlOptions): string {
	const truncatedTitle = escapeHtml(truncateText(title, 50));
	const truncatedExcerpt = excerpt
		? escapeHtml(truncateText(excerpt, 80))
		: null;
	const visibleTags = tags.slice(0, 3);

	const tagsHtml =
		visibleTags.length > 0
			? `<div style="display:flex;gap:16px;flex-wrap:wrap;">${visibleTags
					.map(
						(tag) =>
							`<span style="display:flex;font-size:24px;color:#ffffff;background-color:rgba(255,255,255,0.2);padding:12px 24px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);">${escapeHtml(tag)}</span>`,
					)
					.join("")}</div>`
			: "";

	const excerptHtml = truncatedExcerpt
		? `<p style="display:flex;font-size:32px;color:#cccccc;line-height:1.5;margin-bottom:40px;max-width:100%;overflow:hidden;text-overflow:ellipsis;">${truncatedExcerpt}</p>`
		: "";

	return [
		`<div style="display:flex;flex-direction:column;width:1200px;height:630px;font-family:'Noto Sans JP',system-ui,sans-serif;position:relative;">`,
		`<img src="${bgImageDataUrl}" alt="" style="position:absolute;top:0;left:0;width:1200px;height:630px;" />`,
		`<div style="display:flex;position:absolute;top:0;left:0;width:1200px;height:630px;background-color:rgba(0,0,0,0.6);" />`,
		`<div style="display:flex;flex-direction:column;width:100%;height:100%;padding:80px;position:relative;">`,
		`<div style="display:flex;margin-bottom:60px;">`,
		`<div style="display:flex;font-size:36px;font-weight:bold;color:#ffffff;">burio16.com</div>`,
		`</div>`,
		`<div style="display:flex;flex-direction:column;flex:1;justify-content:center;">`,
		`<h1 style="display:flex;font-size:64px;font-weight:bold;color:#ffffff;line-height:1.4;margin-bottom:30px;max-width:100%;">${truncatedTitle}</h1>`,
		excerptHtml,
		tagsHtml,
		`</div>`,
		`</div>`,
		`</div>`,
	].join("");
}
