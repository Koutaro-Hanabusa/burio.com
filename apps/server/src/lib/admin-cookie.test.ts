import { describe, expect, it } from "vitest";
import {
	ADMIN_COOKIE_NAME,
	buildAdminCookie,
	buildClearAdminCookie,
	parseAdminToken,
} from "./admin-cookie";

describe("buildAdminCookie", () => {
	it("必須属性が含まれる", () => {
		const cookie = buildAdminCookie("tok123");
		expect(cookie).toContain(`${ADMIN_COOKIE_NAME}=tok123`);
		expect(cookie).toContain("HttpOnly");
		expect(cookie).toContain("Secure");
		expect(cookie).toContain("SameSite=Lax");
		expect(cookie).toContain("Path=/");
		expect(cookie).toContain("Max-Age=3600");
	});

	it("maxAgeSeconds オプションで Max-Age を上書きできる", () => {
		const cookie = buildAdminCookie("tok", { maxAgeSeconds: 86400 });
		expect(cookie).toContain("Max-Age=86400");
	});
});

describe("buildClearAdminCookie", () => {
	it("Max-Age=0 でトークン値が空", () => {
		const cookie = buildClearAdminCookie();
		expect(cookie).toContain(`${ADMIN_COOKIE_NAME}=`);
		expect(cookie).toContain("Max-Age=0");
		expect(cookie).toContain("HttpOnly");
	});
});

describe("parseAdminToken", () => {
	it("単一 Cookie から admin_token を取得できる", () => {
		expect(parseAdminToken("admin_token=abc123")).toBe("abc123");
	});

	it("複数 Cookie が混在しても正しく取得できる", () => {
		expect(parseAdminToken("session=xyz; admin_token=mytoken; other=val")).toBe(
			"mytoken",
		);
	});

	it("admin_token が存在しない場合は null を返す", () => {
		expect(parseAdminToken("session=xyz; other=val")).toBeNull();
	});

	it("null / undefined / 空文字は null を返す", () => {
		expect(parseAdminToken(null)).toBeNull();
		expect(parseAdminToken(undefined)).toBeNull();
		expect(parseAdminToken("")).toBeNull();
	});

	it("値に = が含まれる JWT トークンも正しくパースできる", () => {
		// base64 パディング = が値に含まれるケース
		const token = "header.payload.sig==";
		expect(parseAdminToken(`admin_token=${token}`)).toBe(token);
	});
});
