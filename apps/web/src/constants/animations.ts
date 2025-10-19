import type { Transition, Variants } from "framer-motion";

/**
 * Common animation variants and transitions
 */

// Basic fade in animations
export const fadeInVariants: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
};

export const fadeInUpVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

export const fadeInLeftVariants: Variants = {
	hidden: { opacity: 0, x: -10 },
	visible: { opacity: 1, x: 0 },
};

// Section animations
export const sectionVariants: Variants = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0 },
};

// Hero title animation
export const heroTitleVariants: Variants = {
	hidden: { opacity: 0, scale: 0.5, rotate: -10 },
	visible: {
		opacity: 1,
		scale: 1,
		rotate: 0,
	},
	hover: {
		scale: 1.1,
		rotate: [0, -5, 5, -5, 0],
	},
};

// Character animation
export const characterVariants: Variants = {
	hidden: { opacity: 0, y: 50 },
	visible: { opacity: 1, y: 0 },
	hover: {
		y: -10,
		color: "#3b82f6",
	},
};

// Social icon animation
export const socialIconVariants: Variants = {
	hidden: { opacity: 0, scale: 0.5 },
	visible: { opacity: 1, scale: 1 },
};

// Card hover animation
export const cardHoverVariants: Variants = {
	rest: { y: 0 },
	hover: {
		y: -4,
		boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
	},
};

// Transition configurations
export const smoothTransition: Transition = {
	duration: 0.8,
};

export const springTransition: Transition = {
	type: "spring",
	stiffness: 100,
};

export const heroTitleTransition: Transition = {
	delay: 0.2,
	duration: 0.8,
	type: "spring",
	stiffness: 200,
	damping: 10,
};

export const characterHoverTransition: Transition = {
	duration: 0.2,
};

export const heroTitleHoverTransition: Transition = {
	duration: 0.5,
};

// Delay utilities
export const getStaggerDelay = (
	index: number,
	baseDelay = 0,
	increment = 0.1,
): number => {
	return baseDelay + index * increment;
};
