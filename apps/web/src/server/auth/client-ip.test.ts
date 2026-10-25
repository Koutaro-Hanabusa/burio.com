import { describe, expect, it } from "vite-plus/test";
import { getAllowedIPs, getClientIP, isIPAllowed } from "./client-ip";

function makeRequest(headers: Record<string, string>): Request {
	return new Request("http://localhost", { headers });
}

describe("getClientIP", () => {
	it("CF-Connecting-IP を最優先で返す", () => {
		const req = makeRequest({
			"CF-Connecting-IP": "1.2.3.4",
			"X-Forwarded-For": "5.6.7.8",
			"X-Real-IP": "9.10.11.12",
		});
		expect(getClientIP(req)).toBe("1.2.3.4");
	});

	it("CF-Connecting-IP がなければ X-Forwarded-For の左端を返す", () => {
		const req = makeRequest({
			"X-Forwarded-For": "5.6.7.8, 99.99.99.99",
			"X-Real-IP": "9.10.11.12",
		});
		expect(getClientIP(req)).toBe("5.6.7.8");
	});

	it("X-Forwarded-For もなければ X-Real-IP を返す", () => {
		const req = makeRequest({ "X-Real-IP": "9.10.11.12" });
		expect(getClientIP(req)).toBe("9.10.11.12");
	});

	it("すべてのヘッダがなければ 'unknown' を返す", () => {
		const req = makeRequest({});
		expect(getClientIP(req)).toBe("unknown");
	});
});

describe("isIPAllowed", () => {
	const allowed = ["127.0.0.1", "::1", "192.168.", "10.", "2400:4051:"];

	it("完全一致で true", () => {
		expect(isIPAllowed("127.0.0.1", allowed)).toBe(true);
		expect(isIPAllowed("::1", allowed)).toBe(true);
	});

	it("IPv4 プレフィックス一致で true", () => {
		expect(isIPAllowed("192.168.1.100", allowed)).toBe(true);
		expect(isIPAllowed("10.0.0.1", allowed)).toBe(true);
	});

	it("IPv6 プレフィックス一致で true", () => {
		expect(isIPAllowed("2400:4051:dead:beef::1", allowed)).toBe(true);
	});

	it("許可リストにない IP は false", () => {
		expect(isIPAllowed("8.8.8.8", allowed)).toBe(false);
		expect(isIPAllowed("172.31.0.1", allowed)).toBe(false);
	});

	it("許可リストが空なら常に false", () => {
		expect(isIPAllowed("127.0.0.1", [])).toBe(false);
	});
});

describe("getAllowedIPs", () => {
	it("envValue が未設定なら BASE_ALLOWED_IPS のみ返す", () => {
		const ips = getAllowedIPs(undefined);
		expect(ips).toContain("127.0.0.1");
		expect(ips).toContain("::1");
	});

	it("envValue のカンマ区切りエントリが BASE に追加される", () => {
		const ips = getAllowedIPs("203.0.113.1, 198.51.100.0/24");
		expect(ips).toContain("203.0.113.1");
		expect(ips).toContain("198.51.100.0/24");
		// BASE も含まれる
		expect(ips).toContain("127.0.0.1");
	});

	it("空白のみのエントリはフィルタされる", () => {
		const ips = getAllowedIPs("203.0.113.1,  , ");
		expect(ips.filter((ip) => ip.trim() === "")).toHaveLength(0);
	});
});
