import type { ComponentType, SVGProps } from "react";

export type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface SocialLink {
	icon: SocialIcon;
	href: string;
	label: string;
}
