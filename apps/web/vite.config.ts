import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
	plugins: [
		tailwindcss(),
		tanstackStart(),
		cloudflare({
			viteEnvironment: { name: "ssr" },
		}),
		react(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3001,
		preTransformRequests: true,
	},
	build: {
		cssCodeSplit: true,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (!id.includes("node_modules")) return;
					if (/\/(react|react-dom|scheduler)\//.test(id)) return "react";
					if (
						/\/(@tanstack\/(react-router|react-start|react-query|router-core|start))/.test(
							id,
						)
					)
						return "router";
					if (
						/\/(framer-motion|motion|lucide-react|radix-ui|@radix-ui)/.test(id)
					)
						return "ui";
				},
				chunkFileNames: "assets/[name]-[hash].js",
				entryFileNames: "assets/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash].[ext]",
			},
		},
		minify: "esbuild",
		cssMinify: true,
		target: "es2020",
		chunkSizeWarningLimit: 600,
		sourcemap: false,
	},
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"@tanstack/react-router",
			"@tanstack/react-query",
			"framer-motion",
		],
		exclude: [
			"three",
			"@tanstack/react-query-devtools",
			"@tanstack/react-router-devtools",
		],
	},
});
