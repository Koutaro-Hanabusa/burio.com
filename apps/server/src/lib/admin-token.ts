function base64urlEncode(data: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(data)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function base64urlEncodeString(str: string): string {
	return btoa(unescape(encodeURIComponent(str)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array<ArrayBuffer> {
	const padded = str.replace(/-/g, "+").replace(/_/g, "/");
	const padding = (4 - (padded.length % 4)) % 4;
	const base64 = padded + "=".repeat(padding);
	const binary = atob(base64);
	const buf = new ArrayBuffer(binary.length);
	const view = new Uint8Array(buf);
	for (let i = 0; i < binary.length; i++) {
		view[i] = binary.charCodeAt(i);
	}
	return view;
}

async function importKey(secret: string): Promise<CryptoKey> {
	const encoded = new TextEncoder().encode(secret);
	return crypto.subtle.importKey(
		"raw",
		encoded,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}

export interface AdminTokenPayload {
	sub: string;
	iat: number;
	exp: number;
}

const HEADER = base64urlEncodeString(
	JSON.stringify({ alg: "HS256", typ: "JWT" }),
);

// secret は最低 32 バイト以上を推奨
export async function signAdminToken(
	secret: string,
	payload: AdminTokenPayload,
): Promise<string> {
	const encodedPayload = base64urlEncodeString(JSON.stringify(payload));
	const signingInput = `${HEADER}.${encodedPayload}`;

	const key = await importKey(secret);
	const signatureBuffer = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(signingInput),
	);

	return `${signingInput}.${base64urlEncode(signatureBuffer)}`;
}

// 署名不正・期限切れ・形式不正はすべて null（例外は投げない）
export async function verifyAdminToken(
	secret: string,
	token: string,
): Promise<AdminTokenPayload | null> {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;

		const [header, encodedPayload, signature] = parts;
		const signingInput = `${header}.${encodedPayload}`;

		const key = await importKey(secret);
		const signatureBytes = base64urlDecode(signature);

		const valid = await crypto.subtle.verify(
			"HMAC",
			key,
			signatureBytes,
			new TextEncoder().encode(signingInput),
		);
		if (!valid) return null;

		const payloadJson = new TextDecoder().decode(
			base64urlDecode(encodedPayload),
		);
		const payload = JSON.parse(payloadJson) as unknown;

		if (
			typeof payload !== "object" ||
			payload === null ||
			typeof (payload as Record<string, unknown>).sub !== "string" ||
			typeof (payload as Record<string, unknown>).iat !== "number" ||
			typeof (payload as Record<string, unknown>).exp !== "number"
		) {
			return null;
		}

		const typed = payload as AdminTokenPayload;

		if (typed.exp < Math.floor(Date.now() / 1000)) return null;

		return typed;
	} catch {
		return null;
	}
}
