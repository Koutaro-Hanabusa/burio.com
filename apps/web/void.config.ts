import { defineConfig } from "void/config";

export default defineConfig({
	sourceDir: "src",
	output: "server",
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
