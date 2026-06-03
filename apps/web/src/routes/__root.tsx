import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import Header from "@/components/layouts/header";
import NotFound from "@/components/not-found";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { trpc, trpcClient } from "@/utils/trpc";
import appCss from "../index.css?url";

const ReactQueryDevtools =
	import.meta.env.MODE === "development"
		? lazy(() =>
				import("@tanstack/react-query-devtools").then((module) => ({
					default: module.ReactQueryDevtools,
				})),
			)
		: () => null;

const TanStackRouterDevtools =
	import.meta.env.MODE === "development"
		? lazy(() =>
				import("@tanstack/react-router-devtools").then((module) => ({
					default: module.TanStackRouterDevtools,
				})),
			)
		: () => null;

export interface RouterAppContext {
	trpc: typeof trpc;
	queryClient: QueryClient;
}

const criticalCss = `
@font-face { font-display: swap; }
body {
	margin: 0;
	font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
#app { min-height: 100vh; }
`;

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

const gtmNoscriptHtml = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NSXW6XSJ" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{ charSet: "UTF-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
			{ name: "theme-color", content: "#ff914d" },
			{
				name: "description",
				content: "burio16.com - Personal Portfolio and Blog",
			},
			{ title: "burio16.com" },
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "burio16.com" },
			{
				property: "og:title",
				content: "burio16.com　ぶりおのプロフィールサイト",
			},
			{ property: "og:description", content: "burio16.comへようこそ" },
			{ property: "og:url", content: "https://burio16.com/" },
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
				name: "twitter:title",
				content: "burio16.com　ぶりおのプロフィールサイト",
			},
			{ name: "twitter:description", content: "burio16.comへようこそ" },
			{
				name: "twitter:image",
				content: "https://burio16.com/burio.com_ogp.png",
			},
			{ name: "twitter:image:alt", content: "burio16.com thumbnail" },
			{ name: "twitter:url", content: "https://burio16.com/" },
		],
		links: [
			{ rel: "canonical", href: "https://burio16.com/" },
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
			{ rel: "stylesheet", href: appCss },
		],
		scripts: [
			{
				children: gtmDeferredScript,
			},
		],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<head>
				<HeadContent />
				<style dangerouslySetInnerHTML={{ __html: criticalCss }} />
			</head>
			<body>
				<noscript dangerouslySetInnerHTML={{ __html: gtmNoscriptHtml }} />
				<div id="app">{children}</div>
				<Scripts />
			</body>
		</html>
	);
}

function RootComponent() {
	const { queryClient } = Route.useRouteContext();

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
					storageKey="vite-ui-theme"
				>
					<div className="min-h-screen bg-transparent">
						<Header />
						<main className="relative pt-16">
							<Outlet />
						</main>
					</div>
					<Toaster richColors />
				</ThemeProvider>
				{import.meta.env.MODE === "development" && (
					<Suspense fallback={null}>
						<TanStackRouterDevtools position="bottom-left" />
						<ReactQueryDevtools
							position="bottom"
							buttonPosition="bottom-right"
						/>
					</Suspense>
				)}
			</QueryClientProvider>
		</trpc.Provider>
	);
}
