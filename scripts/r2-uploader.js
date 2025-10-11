#!/usr/bin/env node

/**
 * S3クライアントを使用したR2アップローダー
 * 使用方法: bun run scripts/r2-uploader.js <action> [options]
 *
 * アクション:
 * - upload <filePath> <slug> [env]: Markdownファイルをアップロード
 * - list [env]: R2バケット内のファイル一覧
 * - delete <slug> [env]: ファイルを削除
 */

import {
	DeleteObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { existsSync, readFileSync } from "fs";
import path from "path";

// R2設定
const R2_CONFIG = {
	dev: {
		bucketName: "burio-com-blog-dev",
		endpoint:
			"https://8b507ae45219db85402c35138c953727.r2.cloudflarestorage.com",
	},
	prod: {
		bucketName: "burio-com-blog",
		endpoint:
			"https://8b507ae45219db85402c35138c953727.r2.cloudflarestorage.com",
	},
};

function createS3Client() {
	// 環境変数からCloudflare R2の認証情報を取得
	const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

	if (!accessKeyId || !secretAccessKey) {
		console.error("❌ 環境変数が設定されていません:");
		console.error("CLOUDFLARE_R2_ACCESS_KEY_ID");
		console.error("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
		console.error("");
		console.error("設定方法:");
		console.error('export CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"');
		console.error('export CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"');
		process.exit(1);
	}

	return new S3Client({
		region: "auto",
		endpoint: R2_CONFIG.dev.endpoint, // 動的に変更する場合は調整
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});
}

async function uploadFile(filePath, slug, env = "dev") {
	if (!existsSync(filePath)) {
		console.error(`❌ ファイルが見つかりません: ${filePath}`);
		process.exit(1);
	}

	const s3Client = createS3Client();
	const config = R2_CONFIG[env];
	const key = `blog/${slug}.md`;

	try {
		const fileContent = readFileSync(filePath, "utf-8");

		console.log(
			`📤 アップロード中: ${filePath} → R2://${config.bucketName}/${key}`,
		);

		const command = new PutObjectCommand({
			Bucket: config.bucketName,
			Key: key,
			Body: fileContent,
			ContentType: "text/markdown",
			Metadata: {
				slug: slug,
				uploadedAt: new Date().toISOString(),
			},
		});

		await s3Client.send(command);
		console.log(`✅ アップロード完了: ${key}`);
	} catch (error) {
		console.error("❌ アップロードに失敗しました:", error.message);
		process.exit(1);
	}
}

async function listFiles(env = "dev") {
	const s3Client = createS3Client();
	const config = R2_CONFIG[env];

	try {
		const command = new ListObjectsV2Command({
			Bucket: config.bucketName,
			Prefix: "blog/",
		});

		const response = await s3Client.send(command);

		if (!response.Contents || response.Contents.length === 0) {
			console.log("📝 ファイルが見つかりませんでした");
			return;
		}

		console.log(`📁 ${config.bucketName} 内のファイル一覧:`);
		console.log("");

		response.Contents.forEach((obj) => {
			const slug = obj.Key.replace("blog/", "").replace(".md", "");
			const size = (obj.Size / 1024).toFixed(2);
			const date = obj.LastModified.toLocaleDateString("ja-JP");
			console.log(`  📄 ${slug} (${size}KB, ${date})`);
		});
	} catch (error) {
		console.error("❌ ファイル一覧の取得に失敗しました:", error.message);
		process.exit(1);
	}
}

async function deleteFile(slug, env = "dev") {
	const s3Client = createS3Client();
	const config = R2_CONFIG[env];
	const key = `blog/${slug}.md`;

	try {
		console.log(`🗑️  削除中: R2://${config.bucketName}/${key}`);

		const command = new DeleteObjectCommand({
			Bucket: config.bucketName,
			Key: key,
		});

		await s3Client.send(command);
		console.log(`✅ 削除完了: ${key}`);
	} catch (error) {
		console.error("❌ 削除に失敗しました:", error.message);
		process.exit(1);
	}
}

function showHelp() {
	console.log("R2アップローダー - Markdownファイルの管理");
	console.log("");
	console.log("使用方法:");
	console.log(
		"  bun run scripts/r2-uploader.js upload <filePath> <slug> [env]",
	);
	console.log("  bun run scripts/r2-uploader.js list [env]");
	console.log("  bun run scripts/r2-uploader.js delete <slug> [env]");
	console.log("");
	console.log("例:");
	console.log(
		"  bun run scripts/r2-uploader.js upload ./my-post.md my-post-slug",
	);
	console.log("  bun run scripts/r2-uploader.js list dev");
	console.log("  bun run scripts/r2-uploader.js delete my-post-slug prod");
	console.log("");
	console.log("環境: dev (デフォルト) | prod");
}

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		showHelp();
		process.exit(1);
	}

	const [action, ...params] = args;

	try {
		switch (action) {
			case "upload":
				if (params.length < 2) {
					console.error("❌ アップロードには filePath と slug が必要です");
					showHelp();
					process.exit(1);
				}
				await uploadFile(params[0], params[1], params[2] || "dev");
				break;

			case "list":
				await listFiles(params[0] || "dev");
				break;

			case "delete":
				if (params.length < 1) {
					console.error("❌ 削除には slug が必要です");
					showHelp();
					process.exit(1);
				}
				await deleteFile(params[0], params[1] || "dev");
				break;

			default:
				console.error(`❌ 不明なアクション: ${action}`);
				showHelp();
				process.exit(1);
		}
	} catch (error) {
		console.error("❌ エラーが発生しました:", error.message);
		process.exit(1);
	}
}

main();
