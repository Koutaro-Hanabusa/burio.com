#!/usr/bin/env node

/**
 * 既存記事の char_count をバックフィルする。
 * R2 から本文 Markdown を取得し、URL とコードブロックを除いた文字数を D1 に書き戻す。
 *
 * 使用方法:
 *   bun run scripts/backfill-char-count.js [env]
 *
 * env: dev (デフォルト) | prod
 */

import { execSync } from "node:child_process";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { countContentChars } from "./lib/count-content-chars.js";

const R2_CONFIG = {
	dev: {
		bucketName: "burio-com-blog-dev",
		endpoint:
			"https://8b507ae45219db85402c35138c953727.r2.cloudflarestorage.com",
		dbName: "burio-com-dev",
	},
	prod: {
		bucketName: "burio-com-blog",
		endpoint:
			"https://8b507ae45219db85402c35138c953727.r2.cloudflarestorage.com",
		dbName: "burio-com-db",
	},
};

function createS3Client(endpoint) {
	const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
	if (!accessKeyId || !secretAccessKey) {
		console.error(
			"❌ CLOUDFLARE_R2_ACCESS_KEY_ID と CLOUDFLARE_R2_SECRET_ACCESS_KEY が必要です",
		);
		process.exit(1);
	}
	return new S3Client({
		region: "auto",
		endpoint,
		credentials: { accessKeyId, secretAccessKey },
	});
}

function selectPosts(dbName) {
	const command = `bunx wrangler d1 execute ${dbName} --remote --json --command="SELECT id, slug FROM posts ORDER BY id ASC;"`;
	const stdout = execSync(command, { encoding: "utf-8" });
	const parsed = JSON.parse(stdout);
	return parsed?.[0]?.results ?? [];
}

async function fetchR2Content(s3, bucket, key) {
	try {
		const res = await s3.send(
			new GetObjectCommand({ Bucket: bucket, Key: key }),
		);
		return await res.Body.transformToString("utf-8");
	} catch {
		return null;
	}
}

function updateCharCount(dbName, id, charCount) {
	const command = `bunx wrangler d1 execute ${dbName} --remote --command="UPDATE posts SET char_count = ${charCount} WHERE id = ${id};"`;
	execSync(command, { stdio: "inherit" });
}

async function main() {
	const env = process.argv[2] || "dev";
	const config = R2_CONFIG[env];
	if (!config) {
		console.error(`❌ 不明な env: ${env} (dev|prod)`);
		process.exit(1);
	}

	const s3 = createS3Client(config.endpoint);

	console.log(`📊 ${config.dbName} から記事一覧を取得中...`);
	const rows = selectPosts(config.dbName);
	console.log(`📝 ${rows.length} 件の記事をバックフィルします`);

	for (const row of rows) {
		const { id, slug } = row;
		let content = await fetchR2Content(s3, config.bucketName, `blog/${id}.md`);
		if (!content && slug) {
			content = await fetchR2Content(s3, config.bucketName, `blog/${slug}.md`);
		}
		if (!content) {
			console.warn(
				`⚠️  id=${id} (slug=${slug}): R2 オブジェクトが見つかりません。skip`,
			);
			continue;
		}
		const charCount = countContentChars(content);
		console.log(`📐 id=${id} (slug=${slug}): char_count=${charCount}`);
		updateCharCount(config.dbName, id, charCount);
	}

	console.log("✅ バックフィル完了");
}

await main();
