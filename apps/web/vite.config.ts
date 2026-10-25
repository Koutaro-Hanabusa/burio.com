import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { voidReact } from "@void/react/plugin";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

export default defineConfig(({ mode }) => ({
	plugins:
		mode === "test"
			? [tailwindcss()]
			: [voidPlugin(), voidReact(), tailwindcss()],
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		css: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/**",
				"src/test/**",
				"**/*.d.ts",
				"**/*.config.*",
				"**/mockData/**",
				"dist/**",
			],
		},
	},
	server: { port: 3001 },
}));
