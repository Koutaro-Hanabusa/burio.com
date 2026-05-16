// HTTP 標準の Set-Cookie ヘッダを組み立てる純粋関数のみ含む。
// Hono / Express / Fastify / AWS Lambda / Vercel など、
// レスポンスに任意のヘッダを付与できる任意のサーバー FW にそのまま使える。

export const ADMIN_COOKIE_NAME = "admin_token";

const COOKIE_BASE_ATTRS = "HttpOnly; Secure; SameSite=Lax; Path=/";
const DEFAULT_MAX_AGE = 3600;

/**
 * Set-Cookie 用の文字列を返す。
 * Hono なら `c.header("Set-Cookie", buildAdminCookie(token))` で使う。
 * Express なら `res.setHeader("Set-Cookie", buildAdminCookie(token))` で使う。
 */
export function buildAdminCookie(
	token: string,
	options?: { maxAgeSeconds?: number },
): string {
	const maxAge = options?.maxAgeSeconds ?? DEFAULT_MAX_AGE;
	return `${ADMIN_COOKIE_NAME}=${token}; ${COOKIE_BASE_ATTRS}; Max-Age=${maxAge}`;
}

/**
 * Cookie を削除させる Set-Cookie 文字列を返す。
 * Max-Age=0 にすることでブラウザに即時削除させる。
 */
export function buildClearAdminCookie(): string {
	return `${ADMIN_COOKIE_NAME}=; ${COOKIE_BASE_ATTRS}; Max-Age=0`;
}

/**
 * Cookie リクエストヘッダ文字列から admin_token の値を取り出す。
 * Hono なら `c.req.header("Cookie")` を渡す。
 * Express なら `req.headers.cookie` を渡す。
 */
export function parseAdminToken(
	cookieHeader: string | null | undefined,
): string | null {
	if (!cookieHeader) return null;

	for (const part of cookieHeader.split(";")) {
		const [rawKey, ...rawVal] = part.split("=");
		if (rawKey.trim() === ADMIN_COOKIE_NAME) {
			return rawVal.join("=").trim() || null;
		}
	}

	return null;
}
