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
		// Enable CSS code splitting for better caching
		cssCodeSplit: true,

		// Optimize chunk size for better loading performance
		rollupOptions: {
			output: {
				manualChunks: {
					// Separate vendor chunks for better caching
					react: ["react", "react-dom"],
					router: ["@tanstack/react-router", "@tanstack/react-query"],
					three: ["three", "@react-three/fiber", "@react-three/drei"],
					ui: ["framer-motion", "lucide-react"],
				},
				// Optimize chunk naming for better caching
				chunkFileNames: "assets/[name]-[hash].js",
				entryFileNames: "assets/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash].[ext]",
			},
		},

		// Enable minification for production
		minify: "esbuild",
		cssMinify: true,

		// Target modern browsers for smaller bundle size
		target: "es2020",

		// Adjust chunk size warnings
		chunkSizeWarningLimit: 600,

		// Enable source maps for production debugging (optional, can disable for smaller size)
		sourcemap: false,
	},

	// Optimize dependencies pre-bundling
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"@tanstack/react-router",
			"@tanstack/react-query",
			"framer-motion",
		],
		exclude: [
			"three", // Three.js benefits from dynamic loading
			"@tanstack/react-query-devtools",
			"@tanstack/react-router-devtools",
		],
	},

	// Server configuration
	server: {
		// Enable preload for better performance
		preTransformRequests: true,
	},
});
