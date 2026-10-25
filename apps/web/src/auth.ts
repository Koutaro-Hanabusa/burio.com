import { defineAuth } from "void/auth";

export default defineAuth(({ defaults, env }) => {
	const github = defaults.socialProviders?.github;
	if (!github || typeof github === "function")
		throw new Error("GitHub authentication is not configured");
	return {
		...defaults,
		account: {
			...defaults.account,
			accountLinking: {
				...defaults.account?.accountLinking,
				enabled: false,
			},
		},
		socialProviders: {
			...defaults.socialProviders,
			github: {
				...github,
				mapProfileToUser(profile) {
					// Better Auth rejects missing email before account or session creation.
					if (
						typeof env.ADMIN_GITHUB_ID !== "string" ||
						!env.ADMIN_GITHUB_ID ||
						String(profile.id) !== env.ADMIN_GITHUB_ID
					)
						return { email: null };
					return {};
				},
			},
		},
	};
});
