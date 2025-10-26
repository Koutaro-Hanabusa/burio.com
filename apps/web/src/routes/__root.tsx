import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";

// Lazy load devtools only in development
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

import Header from "@/components/header";
import Loader from "@/components/loader";
import NotFound from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { trpc } from "@/utils/trpc";
import "../index.css";

export interface RouterAppContext {
	trpc: typeof trpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{
				title: "burio16.com",
			},
			{
				name: "description",
				content: "burio16.com is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<HelmetProvider>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<div className="min-h-screen bg-transparent">
					<Header />
					<main className="relative pt-16">
						{isFetching ? <Loader /> : <Outlet />}
					</main>
				</div>
				<Toaster richColors />
			</ThemeProvider>
			{import.meta.env.MODE === "development" && (
				<Suspense fallback={null}>
					<TanStackRouterDevtools position="bottom-left" />
					<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
				</Suspense>
			)}
		</HelmetProvider>
	);
}
