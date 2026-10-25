import type { CloudContext } from "void";
import { describe, expect, it, vi } from "vite-plus/test";
import { getSession } from "void/auth";
import { requireAdmin } from "./guard";

vi.mock("void/auth", () => ({ getSession: vi.fn() }));

function context() {
	return {
		redirect: (url: string) =>
			new Response(null, { status: 302, headers: { Location: url } }),
		text: (body: string, status: number) => new Response(body, { status }),
	} as CloudContext;
}

describe("admin guard", () => {
	it("rejects requests without a verified session, including old cookie or IP only", async () => {
		vi.mocked(getSession).mockReturnValue(null);
		const denied = requireAdmin(context());
		expect(denied?.status).toBe(401);
		expect(requireAdmin(context(), true)?.headers.get("Location")).toBe(
			"/admin/login",
		);
	});

	it("allows a verified session", () => {
		vi.mocked(getSession).mockReturnValue({} as ReturnType<typeof getSession>);
		expect(requireAdmin(context())).toBeNull();
	});
});
