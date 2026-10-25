import { defineConfig } from "void/config";

const gtmDeferredScript = `
function loadGTM() {
	((w, d, s, l, i) => {
		w[l] = w[l] || [];
		w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
		var f = d.getElementsByTagName(s)[0],
			j = d.createElement(s),
			dl = l != "dataLayer" ? "&l=" + l : "";
		j.async = true;
		j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
		f.parentNode.insertBefore(j, f);
	})(window, document, "script", "dataLayer", "GTM-NSXW6XSJ");
}
if ("requestIdleCallback" in window) {
	requestIdleCallback(loadGTM);
} else {
	setTimeout(loadGTM, 1);
}
`;

export default defineConfig({
	sourceDir: "src",
	output: "server",
	head: {
		title: "burio16.com",
		htmlAttrs: { lang: "ja" },
		meta: [
			{ charset: "UTF-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
			{ name: "theme-color", content: "#ff914d" },
			{
				name: "description",
				content: "burio16.com - Personal Portfolio and Blog",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "burio16.com" },
			{
				property: "og:image",
				content: "https://burio16.com/burio.com_ogp.png",
			},
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:alt", content: "burio16.com thumbnail" },
			{ property: "og:locale", content: "ja_JP" },
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:image",
				content: "https://burio16.com/burio.com_ogp.png",
			},
			{ name: "twitter:image:alt", content: "burio16.com thumbnail" },
		],
		link: [
			{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/burio.com_transparent.svg",
			},
			{ rel: "apple-touch-icon", href: "/favicon.ico" },
			{ rel: "manifest", href: "/manifest.json" },
			{ rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "prefetch",
				href: "/fonts/helvetiker_regular.typeface.json",
				as: "fetch",
				type: "application/json",
				crossOrigin: "anonymous",
			},
		],
		script: [{ innerHTML: gtmDeferredScript }],
	},
	worker: {
		compatibility_date: "2026-05-14",
		compatibility_flags: ["nodejs_compat"],
	},
	inference: {
		appType: "void",
		bindings: { db: "DB", storage: "R2_BUCKET", kv: false, ai: false },
	},
	cloudflare: {
		name: "burio-com",
		routes: [
			{ pattern: "burio16.com", zone_name: "burio16.com", custom_domain: true },
			{ pattern: "api.burio16.com/*", zone_name: "burio16.com" },
			{
				pattern: "blog.burio16.com",
				zone_name: "burio16.com",
				custom_domain: true,
			},
		],
		d1_databases: [
			{
				binding: "DB",
				database_name: "burio-com-db",
				database_id: "7390edad-195a-4da4-80a8-90209083afcc",
				preview_database_id: "02de547d-2aa5-4183-933a-25503971e540",
			},
		],
		r2_buckets: [{ binding: "R2_BUCKET", bucket_name: "burio-com-blog" }],
		observability: {
			enabled: true,
			traces: { enabled: true },
		},
	},
});
