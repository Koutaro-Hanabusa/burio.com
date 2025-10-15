import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), tanstackRouter({}), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: "dist",
		sourcemap: false,
		minify: "esbuild",
		rollupOptions: {
			output: {
				manualChunks: {
					react: ["react", "react-dom"],
					router: ["@tanstack/react-router"],
					query: ["@tanstack/react-query", "@trpc/client", "@trpc/react-query"],
				},
			},
		},
	},
});
