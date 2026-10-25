// クライアント IP 抽出はプラットフォーム依存:
//   Cloudflare Workers: CF-Connecting-IP (エッジで付与されるため改竄不能)
//   AWS ALB / API Gateway: X-Forwarded-For の左端
//   Express + proxy: req.ip + app.set('trust proxy', true)

export function getClientIP(request: Request): string {
	const cfConnectingIP = request.headers.get("CF-Connecting-IP");
	if (cfConnectingIP) return cfConnectingIP;

	const xForwardedFor = request.headers.get("X-Forwarded-For");
	if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

	const xRealIP = request.headers.get("X-Real-IP");
	if (xRealIP) return xRealIP;

	return "unknown";
}
