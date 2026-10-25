import { describe, expect, it } from "vite-plus/test";
import {
	type AdminTokenPayload,
	signAdminToken,
	verifyAdminToken,
} from "./admin-token";

const SECRET = "test-secret-at-least-32-bytes-long!!";

function nowSec(): number {
	return Math.floor(Date.now() / 1000);
}

function makePayload(
	overrides?: Partial<AdminTokenPayload>,
): AdminTokenPayload {
	const now = nowSec();
	return {
		sub: "admin",
		iat: now,
		exp: now + 3600,
		...overrides,
	};
}

describe("signAdminToken / verifyAdminToken", () => {
	it("sign → verify のラウンドトリップで元のペイロードを返す", async () => {
		const payload = makePayload();
		const token = await signAdminToken(SECRET, payload);
		const result = await verifyAdminToken(SECRET, token);

		expect(result).not.toBeNull();
		expect(result?.sub).toBe("admin");
		expect(result?.iat).toBe(payload.iat);
		expect(result?.exp).toBe(payload.exp);
	});

	it("期限切れトークンは null を返す", async () => {
		const payload = makePayload({ exp: nowSec() - 1 });
		const token = await signAdminToken(SECRET, payload);
		const result = await verifyAdminToken(SECRET, token);

		expect(result).toBeNull();
	});

	it("署名部分を改竄したトークンは null を返す", async () => {
		const token = await signAdminToken(SECRET, makePayload());
		const tampered = token.slice(0, -4) + "XXXX";
		const result = await verifyAdminToken(SECRET, tampered);

		expect(result).toBeNull();
	});

	it("別の secret で検証すると null を返す", async () => {
		const token = await signAdminToken(SECRET, makePayload());
		const result = await verifyAdminToken(
			"other-secret-32-bytes-minimum!!",
			token,
		);

		expect(result).toBeNull();
	});

	it("ドット区切りが不正なトークンは null を返す", async () => {
		expect(await verifyAdminToken(SECRET, "invalid")).toBeNull();
		expect(await verifyAdminToken(SECRET, "a.b")).toBeNull();
		expect(await verifyAdminToken(SECRET, "")).toBeNull();
	});

	it("ペイロードが改竄されたトークンは null を返す", async () => {
		const token = await signAdminToken(SECRET, makePayload());
		const [header, , sig] = token.split(".");
		// exp を過去に変えた別ペイロードを差し込む
		const fakePayload = btoa(JSON.stringify({ sub: "admin", iat: 0, exp: 0 }))
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=+$/, "");
		const tampered = `${header}.${fakePayload}.${sig}`;
		expect(await verifyAdminToken(SECRET, tampered)).toBeNull();
	});
});
