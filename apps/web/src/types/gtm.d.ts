/**
 * GTM (Google Tag Manager) DataLayer Type Definitions
 *
 * This file defines the types for the GTM dataLayer to ensure type safety
 * when pushing events and variables to GTM.
 */

/**
 * GTM DataLayer Event Interface
 * Represents the structure of events pushed to the dataLayer
 */
export interface GTMDataLayerEvent {
	/** Event name for GTM triggers */
	event?: string;
	/** Twitter link click flag - true when Twitter icon is clicked */
	access_twitter?: boolean;
	/** GitHub link click flag - true when GitHub icon is clicked */
	access_github?: boolean;
	/** Instagram link click flag - true when Instagram icon is clicked */
	access_instagram?: boolean;
}

/**
 * GTM DataLayer Type
 * Array of events and variables pushed to GTM
 */
export type GTMDataLayer = GTMDataLayerEvent[];

/**
 * Window interface extension for GTM dataLayer
 */
declare global {
	interface Window {
		dataLayer?: GTMDataLayer;
	}
}
