/**
 * Environment configuration
 * Centralizes environment variable access with fallback values
 */

const DEFAULT_SERVER_URL =
	"https://burio-com-server.koutarouhanabusa.workers.dev";

export const env = {
	/**
	 * Server URL for API requests
	 * Defaults to production URL if not set
	 */
	serverUrl: import.meta.env.VITE_SERVER_URL || DEFAULT_SERVER_URL,

	/**
	 * Whether we're in development mode
	 */
	isDev: import.meta.env.DEV,

	/**
	 * Whether we're in production mode
	 */
	isProd: import.meta.env.PROD,
} as const;

// Log environment configuration in development
if (env.isDev) {
	console.log("[ENV] Server URL:", env.serverUrl);
	console.log("[ENV] Mode:", env.isProd ? "production" : "development");
}
