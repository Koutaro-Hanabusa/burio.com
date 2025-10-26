/**
 * GTM Analytics Utilities
 *
 * Helper functions for pushing events and variables to GTM dataLayer.
 * Provides type-safe methods for tracking user interactions.
 */

import type { GTMDataLayerEvent } from "@/types/gtm";

/**
 * Check if we're in development mode
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Safely push data to GTM dataLayer
 *
 * @param data - Event data to push to dataLayer
 * @example
 * dataPushLayer({ event: 'click', access_github: true });
 */
export function dataPushLayer(data: GTMDataLayerEvent): void {
	// Initialize dataLayer if it doesn't exist
	if (typeof window !== "undefined") {
		window.dataLayer = window.dataLayer || [];

		// Push data to dataLayer
		window.dataLayer.push(data);

		// Log in development mode for debugging
		if (isDevelopment) {
			console.log("[GTM DataLayer]", data);
		}
	} else if (isDevelopment) {
		console.warn(
			"[GTM DataLayer] window is undefined, skipping dataLayer push",
		);
	}
}

/**
 * Social media platform type
 */
export type SocialPlatform = "twitter" | "github" | "instagram";

/**
 * Track social media link click
 *
 * @param platform - Social media platform name
 * @example
 * trackSocialClick('github');
 * trackSocialClick('twitter');
 */
export function trackSocialClick(platform: SocialPlatform): void {
	const eventData: GTMDataLayerEvent = {
		event: "social_click",
	};

	// Set the appropriate flag based on platform
	switch (platform) {
		case "github":
			eventData.access_github = true;
			break;
		case "twitter":
			eventData.access_twitter = true;
			break;
		case "instagram":
			eventData.access_instagram = true;
			break;
	}

	dataPushLayer(eventData);

	if (isDevelopment) {
		console.log(`[Analytics] ${platform} link clicked`);
	}
}
