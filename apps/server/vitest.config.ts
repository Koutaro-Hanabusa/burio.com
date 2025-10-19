import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		include: ["**/*.test.ts", "**/*.spec.ts"],
		exclude: ["node_modules", "dist", ".wrangler"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				".wrangler/",
				"**/*.test.ts",
				"**/*.spec.ts",
				"**/test/**",
			],
		},
		mockReset: true,
		restoreMocks: true,
		clearMocks: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
