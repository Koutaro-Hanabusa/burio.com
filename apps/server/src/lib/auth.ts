import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { users } from "../db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: {
			user: users,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	advanced: {
		crossSubDomainCookies: {
			enabled: true,
			domain: ".koutarouhanabusa.workers.dev", // For workers.dev subdomain
			// For production, uncomment and replace with your domain:
			// domain: ".burio16.com", // Allows cookies across burio16.com and api.burio16.com
		},
	},
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	secret:
		process.env.BETTER_AUTH_SECRET ||
		(() => {
			throw new Error("BETTER_AUTH_SECRET environment variable is required");
		})(),
	trustedOrigins: [
		"http://localhost:3001",
		"https://burio-com.koutarouhanabusa.workers.dev",
		"https://burio16.com",
		"https://www.burio16.com",
	],
});
