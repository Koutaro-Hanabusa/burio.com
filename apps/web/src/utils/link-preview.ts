import type { MarkedExtension, Tokens } from "marked";

export interface OgpData {
	title: string;
	description: string;
	image: string;
	siteName: string;
	favicon: string | null;
	url: string;
}

const ogpCache = new Map<string, OgpData>();

export async function fetchOgpData(url: string): Promise<OgpData | null> {
	if (ogpCache.has(url)) {
		return ogpCache.get(url)!;
	}

	try {
		const apiBase = import.meta.env.VITE_SERVER_URL;
		const res = await fetch(
			`${apiBase}/api/ogp?url=${encodeURIComponent(url)}`,
		);
		if (!res.ok) return null;
		const data: OgpData = await res.json();
		ogpCache.set(url, data);
		return data;
	} catch {
		return null;
	}
}

/**
 * Custom marked extension that detects standalone URLs in paragraphs
 * and replaces them with link preview placeholder HTML.
 *
 * A "standalone URL" is a paragraph that contains only a single link
 * (e.g., a bare URL on its own line).
 */
export const linkPreviewExtension: MarkedExtension = {
	renderer: {
		paragraph({ tokens }: Tokens.Paragraph) {
			// Check if paragraph contains only a single link token
			// (possibly with surrounding whitespace text tokens)
			const nonEmptyTokens = tokens.filter(
				(t) => !(t.type === "text" && t.raw.trim() === ""),
			);

			if (nonEmptyTokens.length === 1 && nonEmptyTokens[0].type === "link") {
				const link = nonEmptyTokens[0] as Tokens.Link;
				const href = link.href;

				// Only create preview for http(s) URLs
				if (href.startsWith("http://") || href.startsWith("https://")) {
					const escapedUrl = href
						.replace(/&/g, "&amp;")
						.replace(/"/g, "&quot;")
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;");
					const hostname = new URL(href).hostname;

					return `<div class="link-preview" data-url="${escapedUrl}">
  <a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="link-preview-card">
    <div class="link-preview-body">
      <div class="link-preview-title">${escapedUrl}</div>
      <div class="link-preview-site">
        <span>${hostname}</span>
      </div>
    </div>
  </a>
</div>\n`;
				}
			}

			// Default paragraph rendering
			return false;
		},
	},
};

/**
 * After markdown HTML is set in the DOM, find all link preview placeholders
 * and populate them with fetched OGP data.
 */
export async function hydrateLinkPreviews(
	container: HTMLElement,
): Promise<void> {
	const previews = container.querySelectorAll<HTMLDivElement>(
		".link-preview[data-url]",
	);
	if (previews.length === 0) return;

	const fetchPromises = Array.from(previews).map(async (el) => {
		const url = el.dataset.url;
		if (!url) return;

		const data = await fetchOgpData(url);
		if (!data) return;

		const card = el.querySelector(".link-preview-card") as HTMLAnchorElement;
		if (!card) return;

		const title = data.title || url;
		const description = data.description || "";
		const siteName = data.siteName || new URL(url).hostname;
		const favicon = data.favicon || "";
		const image = data.image || "";

		const escapeHtml = (str: string) =>
			str
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;");

		card.innerHTML = `${
			image
				? `<div class="link-preview-image"><img src="${escapeHtml(image)}" alt="" loading="lazy" /></div>`
				: ""
		}<div class="link-preview-body">
      <div class="link-preview-title">${escapeHtml(title)}</div>
      ${description ? `<div class="link-preview-description">${escapeHtml(description)}</div>` : ""}
      <div class="link-preview-site">
        ${favicon ? `<img src="${escapeHtml(favicon)}" alt="" class="link-preview-favicon" />` : ""}
        <span>${escapeHtml(siteName)}</span>
      </div>
    </div>`;
	});

	await Promise.allSettled(fetchPromises);
}
