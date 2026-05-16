// ① クライアント IP 抽出はプラットフォーム依存:
//   - Cloudflare Workers: CF-Connecting-IP (エッジで付与されるため改竄不能)
//   - AWS ALB / API Gateway: X-Forwarded-For の左端
//   - Vercel: X-Forwarded-For or X-Real-IP
//   - Express + 信頼できる proxy: req.ip + app.set('trust proxy', true)
//     → Express では Request オブジェクトが fetch 標準と異なるため
//       getClientIP を req.ip に差し替えること
//
// ② isIPAllowed / getAllowedIPs はプラットフォーム非依存の純粋関数。

// 開発フォールバック用の許可プレフィックスリスト
const BASE_ALLOWED_IPS: string[] = [
	"127.0.0.1",
	"::1",
	"192.168.",
	"10.",
	"172.16.",
];

/**
 * fetch 標準の Request からクライアント IP を取得する。
 * Cloudflare Workers 優先、次いで X-Forwarded-For 左端、X-Real-IP の順。
 */
export function getClientIP(request: Request): string {
	const cfConnectingIP = request.headers.get("CF-Connecting-IP");
	if (cfConnectingIP) return cfConnectingIP;

	const xForwardedFor = request.headers.get("X-Forwarded-For");
	if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

	const xRealIP = request.headers.get("X-Real-IP");
	if (xRealIP) return xRealIP;

	return "unknown";
}

/**
 * IP が許可リストに含まれるか判定する。
 * allowedIPs の各エントリは完全一致、もしくは "." / ":" 末尾のプレフィックス一致。
 */
export function isIPAllowed(ip: string, allowedIPs: string[]): boolean {
	if (allowedIPs.includes(ip)) return true;

	for (const entry of allowedIPs) {
		// IPv4 プレフィックス: "192.168." など
		if (entry.endsWith(".") && ip.startsWith(entry)) return true;
		// IPv6 プレフィックス: "2400:4051:" など
		if (entry.endsWith(":") && ip.startsWith(entry)) return true;
	}

	return false;
}

/**
 * 環境変数文字列（カンマ区切り）を BASE_ALLOWED_IPS と合成して許可リストを返す。
 *
 * - envValue が未設定の場合は BASE_ALLOWED_IPS のみを返す
 * - 本番では ADMIN_ALLOWED_IPS に固定 IP / プレフィックスを設定すること
 */
export function getAllowedIPs(envValue: string | undefined): string[] {
	if (!envValue) return [...BASE_ALLOWED_IPS];

	const additional = envValue
		.split(",")
		.map((ip) => ip.trim())
		.filter((ip) => ip.length > 0);

	return [...BASE_ALLOWED_IPS, ...additional];
}
