import { GithubIcon } from "@/components/icons/github";
import { InstagramIcon } from "@/components/icons/instagram";
import { TwitterIcon } from "@/components/icons/twitter";
import type { SocialLink } from "@/types/social";

export const SOCIAL_LINKS: SocialLink[] = [
	{
		icon: GithubIcon,
		href: "https://github.com/Koutaro-Hanabusa?tab=repositories",
		label: "GitHub",
	},
	{
		icon: TwitterIcon,
		href: "https://x.com/burio_16",
		label: "Twitter",
	},
	{
		icon: InstagramIcon,
		href: "https://www.instagram.com/buri_yellowtail?igsh=b2wyaTBpZ3dicmd0&utm_source=qr",
		label: "Instagram",
	},
];
