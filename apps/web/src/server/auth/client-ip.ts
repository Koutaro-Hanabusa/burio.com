// クライアント IP 抽出はプラットフォーム依存:
//   Cloudflare Workers: CF-Connecting-IP (エッジで付与されるため改竄不能)
//   AWS ALB / API Gateway: X-Forwarded-For の左端
//   Express + proxy: req.ip + app.set('trust proxy', true)

const BASE_ALLOWED_IPS: string[] = [
	"127.0.0.1",
	"::1",
	"192.168.",
	"10.",
	"172.16.",
];

export function getClientIP(request: Request): string {
	const cfConnectingIP = request.headers.get("CF-Connecting-IP");
	if (cfConnectingIP) return cfConnectingIP;

	const xForwardedFor = request.headers.get("X-Forwarded-For");
	if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

	const xRealIP = request.headers.get("X-Real-IP");
	if (xRealIP) return xRealIP;

	return "unknown";
}

// allowedIPs の各エントリは完全一致、もしくは "." / ":" 末尾のプレフィックス一致
export function isIPAllowed(ip: string, allowedIPs: string[]): boolean {
	if (allowedIPs.includes(ip)) return true;

	for (const entry of allowedIPs) {
		if (entry.endsWith(".") && ip.startsWith(entry)) return true;
		if (entry.endsWith(":") && ip.startsWith(entry)) return true;
	}

	return false;
}

export function getAllowedIPs(envValue: string | undefined): string[] {
	if (!envValue) return [...BASE_ALLOWED_IPS];

	const additional = envValue
		.split(",")
		.map((ip) => ip.trim())
		.filter((ip) => ip.length > 0);

	return [...BASE_ALLOWED_IPS, ...additional];
}
