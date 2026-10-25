import { defineHandler } from "void";

function meta(html: string, name: string) {
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = html.match(
		new RegExp(
			`<meta[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`,
			"i",
		),
	);
	return match?.[1] || match?.[2] || "";
}

function absolute(value: string, base: URL) {
	try {
		return value ? new URL(value, base).href : "";
	} catch {
		return "";
	}
}

export const GET = defineHandler(async (c) => {
	const input = c.req.query("url");
	if (!input) return c.json({ error: "URL is required" }, 400);
	let url: URL;
	try {
		url = new URL(input);
	} catch {
		return c.json({ error: "Invalid URL" }, 400);
	}
	if (
		!["http:", "https:"].includes(url.protocol) ||
		url.username ||
		url.password
	)
		return c.json({ error: "Invalid URL protocol" }, 400);
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (compatible; burio16-bot/1.0; +https://burio16.com)",
				Accept: "text/html,application/xhtml+xml",
				"Accept-Language": "ja,en;q=0.8",
			},
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok || !response.body)
			return c.json({ error: "Failed to fetch URL" }, 502);
		const reader = response.body.getReader();
		const chunks: Uint8Array[] = [];
		let length = 0;
		while (length < 1_000_000) {
			const { done, value } = await reader.read();
			if (done) break;
			length += value.byteLength;
			chunks.push(value);
		}
		await reader.cancel();
		const bytes = new Uint8Array(length);
		let offset = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, offset);
			offset += chunk.length;
		}
		const html = new TextDecoder().decode(bytes);
		const image = meta(html, "og:image") || meta(html, "twitter:image");
		const icon = html.match(
			/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i,
		)?.[1];
		return c.json(
			{
				title:
					meta(html, "og:title") ||
					meta(html, "twitter:title") ||
					html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
					"",
				description:
					meta(html, "og:description") ||
					meta(html, "twitter:description") ||
					meta(html, "description"),
				image: absolute(image, url),
				siteName: meta(html, "og:site_name") || url.hostname,
				favicon: absolute(icon || "/favicon.ico", url),
				url: input,
			},
			200,
			{ "Cache-Control": "public, max-age=86400" },
		);
	} catch (error) {
		console.error("OGP fetch error:", error);
		return c.json({ error: "Failed to fetch OGP data" }, 502);
	}
});
