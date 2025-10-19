import { Github, Instagram, Twitter } from "lucide-react";
import type { SocialLink } from "@/types/social";

export const SOCIAL_LINKS: SocialLink[] = [
	{
		icon: Github,
		href: "https://github.com/Koutaro-Hanabusa?tab=repositories",
		label: "GitHub",
	},
	{
		icon: Twitter,
		href: "https://x.com/buri16_koutaro",
		label: "Twitter",
	},
	{
		icon: Instagram,
		href: "https://www.instagram.com/buri_yellowtail?igsh=b2wyaTBpZ3dicmd0&utm_source=qr",
		label: "Instagram",
	},
];
