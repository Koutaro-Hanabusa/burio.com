#!/usr/bin/env node

/**
 * R2へのMarkdownファイルアップロード用スクリプト
 * 使用方法: bun run scripts/upload-to-r2.js <markdownファイルパス> <スラッグ>
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";

function uploadToR2(filePath, slug, env = "dev") {
	if (!existsSync(filePath)) {
		console.error(`❌ ファイルが見つかりません: ${filePath}`);
		process.exit(1);
	}

	const bucketName = env === "dev" ? "burio-com-blog-dev" : "burio-com-blog";
	const r2Path = `blog/${slug}.md`;

	try {
		console.log(
			`📤 アップロード中: ${filePath} → R2://${bucketName}/${r2Path}`,
		);

		const command = `bunx wrangler r2 object put ${bucketName}/${r2Path} --file "${filePath}"`;
		execSync(command, { stdio: "inherit" });

		console.log(`✅ アップロード完了: ${r2Path}`);
	} catch (error) {
		console.error("❌ アップロードに失敗しました:", error.message);
		process.exit(1);
	}
}

function main() {
	const args = process.argv.slice(2);

	if (args.length < 2) {
		console.log(
			"使用方法: bun run scripts/upload-to-r2.js <markdownファイルパス> <スラッグ> [環境]",
		);
		console.log(
			"例: bun run scripts/upload-to-r2.js ./my-post.md my-post-slug dev",
		);
		process.exit(1);
	}

	const [filePath, slug, env = "dev"] = args;
	uploadToR2(filePath, slug, env);
}

main();
