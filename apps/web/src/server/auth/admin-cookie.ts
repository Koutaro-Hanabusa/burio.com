export const ADMIN_COOKIE_NAME = "admin_token";

const COOKIE_BASE_ATTRS = "HttpOnly; Secure; SameSite=Lax; Path=/";
const DEFAULT_MAX_AGE = 3600;

export function buildAdminCookie(
	token: string,
	options?: { maxAgeSeconds?: number },
): string {
	const maxAge = options?.maxAgeSeconds ?? DEFAULT_MAX_AGE;
	return `${ADMIN_COOKIE_NAME}=${token}; ${COOKIE_BASE_ATTRS}; Max-Age=${maxAge}`;
}

export function buildClearAdminCookie(): string {
	return `${ADMIN_COOKIE_NAME}=; ${COOKIE_BASE_ATTRS}; Max-Age=0`;
}

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
