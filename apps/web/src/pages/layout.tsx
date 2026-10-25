import type { ReactNode } from "react";
import Header from "@/components/layouts/header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "@/index.css";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<noscript>
				<iframe
					src="https://www.googletagmanager.com/ns.html?id=GTM-NSXW6XSJ"
					height="0"
					width="0"
					title="Google Tag Manager"
					style={{ display: "none", visibility: "hidden" }}
				/>
			</noscript>
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<div className="min-h-screen bg-transparent">
					<Header />
					<main className="relative pt-16">{children}</main>
				</div>
				<Toaster richColors />
			</ThemeProvider>
		</>
	);
}
