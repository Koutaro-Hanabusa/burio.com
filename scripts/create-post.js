#!/usr/bin/env node

/**
 * ブログ記事作成ヘルパースクリプト
 * 使用方法: bun run scripts/create-post.js
 *
 * このスクリプトは以下の機能を提供します：
 * 1. インタラクティブな記事作成
 * 2. DBへのメタデータ挿入
 * 3. R2への自動アップロード
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";
import { countContentChars } from "./lib/count-content-chars.js";

// slug生成関数
function createSlug(title) {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

// インタラクティブ入力
function prompt(question) {
	process.stdout.write(question);
	process.stdin.setEncoding("utf-8");

	return new Promise((resolve) => {
		process.stdin.once("data", (data) => {
			resolve(data.toString().trim());
		});
	});
}

// Markdownテンプレート生成
function generateMarkdownTemplate(title, tags = []) {
	const date = new Date().toLocaleDateString("ja-JP");
	const tagsString =
		tags.length > 0 ? tags.map((tag) => `#${tag}`).join(" ") : "";

	return `# ${title}

> 作成日: ${date}
> タグ: ${tagsString}

## 概要

この記事では...

## 内容

### セクション1

内容を記載してください。

### セクション2

内容を記載してください。

## まとめ

記事のまとめを記載してください。

---

*この記事は [burio.com](https://burio16.com) で公開されています。*
`;
}

// DBにメタデータを挿入
function insertToDatabase(postData, env = "dev") {
	const { id, title, slug, excerpt, authorId, published, charCount } = postData;
	const dbName = env === "dev" ? "burio-com-dev" : "burio-com-db";

	const sql = `INSERT INTO posts (id, title, slug, excerpt, author_id, published, char_count, views, created_at, updated_at) VALUES ('${id}', '${title}', '${slug}', '${excerpt}', '${authorId}', ${published ? 1 : 0}, ${charCount}, 0, strftime('%s', 'now'), strftime('%s', 'now'));`;

	const command = `bunx wrangler d1 execute ${dbName} --remote --command="${sql}"`;

	try {
		execSync(command, { stdio: "inherit" });
		console.log("✅ DBにメタデータを挿入しました");
	} catch (error) {
		console.error("❌ DB挿入に失敗しました:", error.message);
		throw error;
	}
}

async function main() {
	console.log("📝 新しいブログ記事を作成します\\n");

	try {
		// 記事情報の入力
		const title = await prompt("記事タイトル: ");
		if (!title) {
			console.error("❌ タイトルは必須です");
			process.exit(1);
		}

		const slug = createSlug(title);
		console.log(`生成されたスラッグ: ${slug}`);

		const excerpt = await prompt("記事の概要 (省略可): ");
		const tagsInput = await prompt("タグ (カンマ区切り、省略可): ");
		const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : [];

		const publishedInput = await prompt("公開しますか？ (y/N): ");
		const published = publishedInput.toLowerCase() === "y";

		const envInput = await prompt("環境 (dev/prod) [dev]: ");
		const env = envInput || "dev";

		// ファイル名とパス
		const fileName = `${slug}.md`;
		const filePath = path.join(process.cwd(), "temp", fileName);

		// tempディレクトリを作成
		execSync("mkdir -p temp", { stdio: "inherit" });

		// Markdownファイル生成
		const markdownContent = generateMarkdownTemplate(title, tags);
		writeFileSync(filePath, markdownContent, "utf-8");

		console.log(`\\n📄 Markdownファイルを生成しました: ${filePath}`);
		console.log("内容を編集してからエンターキーを押してください...");

		await prompt("");

		// ファイルの存在確認
		if (!existsSync(filePath)) {
			console.error("❌ Markdownファイルが見つかりません");
			process.exit(1);
		}

		const content = readFileSync(filePath, "utf-8");

		const postData = {
			id: createId(),
			title,
			slug,
			excerpt: excerpt || `${title}についての記事です。`,
			authorId: "test-user-1", // TODO: 実際の認証システムと連携
			published,
			tags,
			charCount: countContentChars(content),
		};

		console.log("\\n🚀 記事を作成中...");

		// R2にアップロード
		console.log("📤 R2にアップロード中...");
		execSync(
			`bun run scripts/r2-uploader.js upload "${filePath}" "${slug}" "${env}"`,
			{ stdio: "inherit" },
		);

		// DBに挿入
		console.log("💾 DBにメタデータを挿入中...");
		insertToDatabase(postData, env);

		console.log("\\n✅ 記事の作成が完了しました！");
		console.log(`📄 ID: ${postData.id}`);
		console.log(`🔗 スラッグ: ${postData.slug}`);
		console.log(`📈 公開状態: ${published ? "公開" : "下書き"}`);
		console.log(`🌍 環境: ${env}`);

		// 一時ファイルの削除確認
		const cleanupInput = await prompt(
			"\\n一時ファイルを削除しますか？ (Y/n): ",
		);
		if (cleanupInput.toLowerCase() !== "n") {
			execSync(`rm -f "${filePath}"`, { stdio: "inherit" });
			console.log("🗑️  一時ファイルを削除しました");
		}
	} catch (error) {
		console.error("❌ エラーが発生しました:", error.message);
		process.exit(1);
	}

	process.exit(0);
}

void main();
