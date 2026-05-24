import { TRPCError } from "@trpc/server";
import { t } from "../lib/trpc";

// 基本的な許可IPリスト（開発用）
const BASE_ALLOWED_IPS = [
	"127.0.0.1", // localhost
	"::1", // localhost IPv6
	"192.168.", // ローカルネットワーク (prefix match)
	"10.", // プライベートIP (prefix match)
	"172.16.", // プライベートIP範囲の一部 (prefix match)
];

// 環境変数から許可IPリストを取得
function getAllowedIPs(): string[] {
	const envAllowedIPs = process.env.ADMIN_ALLOWED_IPS;

	if (!envAllowedIPs) {
		console.log(
			"⚠️ ADMIN_ALLOWED_IPS environment variable not set, using development defaults",
		);
		return BASE_ALLOWED_IPS;
	}

	// カンマ区切りの文字列を配列に変換
	const additionalIPs = envAllowedIPs
		.split(",")
		.map((ip) => ip.trim())
		.filter((ip) => ip.length > 0);

	const allowedIPs = [...BASE_ALLOWED_IPS, ...additionalIPs];
	console.log(`🔒 Loaded ${allowedIPs.length} allowed IP addresses`);

	return allowedIPs;
}

/**
 * CloudflareのヘッダーからクライアントのリアルIPアドレスを取得
 */
export function getClientIP(request: Request): string {
	// Cloudflare-specific headers
	const cfConnectingIP = request.headers.get("CF-Connecting-IP");
	if (cfConnectingIP) {
		return cfConnectingIP;
	}

	// Other common headers
	const xForwardedFor = request.headers.get("X-Forwarded-For");
	if (xForwardedFor) {
		// X-Forwarded-For can contain multiple IPs, take the first one
		return xForwardedFor.split(",")[0].trim();
	}

	const xRealIP = request.headers.get("X-Real-IP");
	if (xRealIP) {
		return xRealIP;
	}

	// Fallback (should not happen in production with Cloudflare)
	return "unknown";
}

/**
 * IPアドレスが許可リストに含まれているかチェック
 */
export function isIPAllowed(ip: string): boolean {
	const allowedIPs = getAllowedIPs();

	// 開発環境では制限を緩く
	if (process.env.NODE_ENV === "development") {
		console.log(`🔍 IP check (dev mode): ${ip} - ALLOWED`);
		return true;
	}

	// 完全一致チェック
	if (allowedIPs.includes(ip)) {
		console.log(`✅ IP allowed (exact match): ${ip}`);
		return true;
	}

	// プレフィックス一致チェック (IPv4とIPv6の両方に対応)
	for (const allowedIP of allowedIPs) {
		// IPv4プレフィックス (例: "192.168.")
		if (allowedIP.endsWith(".") && ip.startsWith(allowedIP)) {
			console.log(`✅ IP allowed (prefix match): ${ip} matches ${allowedIP}`);
			return true;
		}
		// IPv6プレフィックス (例: "2400:4051:")
		if (allowedIP.endsWith(":") && ip.startsWith(allowedIP)) {
			console.log(
				`✅ IP allowed (IPv6 prefix match): ${ip} matches ${allowedIP}`,
			);
			return true;
		}
	}

	console.log(`❌ IP denied: ${ip}`);
	return false;
}

/**
 * IPアドレスの制限チェックを実行する関数
 * テスト可能なように抽出
 */
export function checkIPRestriction(req?: Request): void {
	if (req) {
		const clientIP = getClientIP(req);

		if (!isIPAllowed(clientIP)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `Access denied from IP: ${clientIP}`,
			});
		}
	}
}

/**
 * 管理者用ルートのIPアドレス制限ミドルウェア
 */
export function createAdminIPMiddleware() {
	return t.middleware(async ({ ctx, next }) => {
		checkIPRestriction(ctx.req);
		return next({ ctx });
	});
}

/**
 * 現在のIPアドレスを取得するためのヘルパー
 */
export function getCurrentIP(request: Request): {
	ip: string;
	allowed: boolean;
} {
	const ip = getClientIP(request);
	const allowed = isIPAllowed(ip);

	return { ip, allowed };
}
