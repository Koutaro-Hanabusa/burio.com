import { describe, expect, it } from "vite-plus/test";
import authConfig from "./auth";

if (typeof authConfig !== "function") throw new Error("Expected auth config");

function configuredWith(env: Record<string, unknown>) {
	const options = authConfig({
		defaults: {
			socialProviders: {
				github: { clientId: "test-id", clientSecret: "test-secret" },
			},
		},
		env,
		dialect: "sqlite",
		request: new Request("https://example.com/api/auth/callback/github"),
	});
	const github = options.socialProviders?.github;
	if (!github || typeof github === "function")
		throw new Error("Expected GitHub provider");
	return { options, github };
}

const { options, github } = configuredWith({ ADMIN_GITHUB_ID: "123456" });

describe("GitHub administrator login", () => {
	it("allows only the configured GitHub account ID", () => {
		expect(github.mapProfileToUser?.({ id: "123456" } as never)).toEqual({});
		expect(github.mapProfileToUser?.({ id: 123456 } as never)).toEqual({});
		expect(github.mapProfileToUser?.({ id: "1" } as never)).toEqual({
			email: null,
		});
		expect(github.mapProfileToUser?.({} as never)).toEqual({ email: null });
	});

	it("rejects login when the allowed account ID is missing or empty", () => {
		for (const env of [{}, { ADMIN_GITHUB_ID: "" }]) {
			const { github } = configuredWith(env);
			expect(github.mapProfileToUser?.({ id: "123456" } as never)).toEqual({
				email: null,
			});
		}
	});

	it("keeps email and password disabled", () => {
		expect(options.emailAndPassword?.enabled).not.toBe(true);
		expect(options.account?.accountLinking?.enabled).toBe(false);
	});
});
