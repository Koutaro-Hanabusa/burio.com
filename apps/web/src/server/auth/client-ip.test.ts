import { describe, expect, it } from "vite-plus/test";
import { getClientIP } from "./client-ip";

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
