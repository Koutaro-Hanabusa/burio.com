import { Github, Instagram, Twitter } from "lucide-react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { SOCIAL_LINKS } from "@/constants/social-links";
import type { SocialLink } from "./social";

describe("SocialLink型", () => {
	describe("型定義の整合性", () => {
		it("SocialLinkインターフェースが正しいプロパティを持つ", () => {
			const socialLink: SocialLink = {
				icon: Github,
				href: "https://github.com/test",
				label: "GitHub",
			};

			expect(socialLink).toHaveProperty("icon");
			expect(socialLink).toHaveProperty("href");
			expect(socialLink).toHaveProperty("label");
			expect(typeof socialLink.href).toBe("string");
			expect(typeof socialLink.label).toBe("string");
		});

		it("hrefプロパティは有効なURLである", () => {
			const socialLink: SocialLink = {
				icon: Twitter,
				href: "https://twitter.com/test",
				label: "Twitter",
			};

			expect(socialLink.href).toMatch(/^https?:\/\/.+/);
		});

		it("iconプロパティはLucideIconコンポーネントである", () => {
			const socialLink: SocialLink = {
				icon: Instagram,
				href: "https://instagram.com/test",
				label: "Instagram",
			};

			// Lucide iconはReactコンポーネント（オブジェクトまたは関数）である
			expect(typeof socialLink.icon).toMatch(/^(function|object)$/);
		});
	});

	describe("定数データの型整合性", () => {
		it("SOCIAL_LINKS定数がSocialLink[]型に準拠している", () => {
			expect(Array.isArray(SOCIAL_LINKS)).toBe(true);
			expect(SOCIAL_LINKS.length).toBeGreaterThan(0);

			SOCIAL_LINKS.forEach((link) => {
				expect(link).toHaveProperty("icon");
				expect(link).toHaveProperty("href");
				expect(link).toHaveProperty("label");
				expect(typeof link.href).toBe("string");
				expect(typeof link.label).toBe("string");
			});
		});

		it("SOCIAL_LINKSの全てのhrefが有効なURLである", () => {
			SOCIAL_LINKS.forEach((link) => {
				expect(link.href).toMatch(/^https?:\/\/.+/);
			});
		});

		it("SOCIAL_LINKSのiconが全てLucideIconである", () => {
			SOCIAL_LINKS.forEach((link) => {
				// Lucide iconはコンポーネント（オブジェクトまたは関数）
				const iconType = typeof link.icon;
				expect(iconType === "function" || iconType === "object").toBe(true);
			});
		});

		it("SOCIAL_LINKSに期待されるソーシャルリンクが含まれている", () => {
			const labels = SOCIAL_LINKS.map((link) => link.label);
			expect(labels).toContain("GitHub");
			expect(labels).toContain("Twitter");
			expect(labels).toContain("Instagram");
		});
	});

	describe("TypeScript型チェック", () => {
		it("SocialLinkの型が正しく推論される", () => {
			const link: SocialLink = {
				icon: Github,
				href: "https://github.com",
				label: "GitHub",
			};

			expectTypeOf(link).toMatchTypeOf<SocialLink>();
			expectTypeOf(link.href).toBeString();
			expectTypeOf(link.label).toBeString();
		});

		it("SOCIAL_LINKS配列の型が正しい", () => {
			expectTypeOf(SOCIAL_LINKS).toBeArray();
			expectTypeOf(SOCIAL_LINKS).items.toMatchTypeOf<SocialLink>();
		});
	});

	describe("データの実際の値の検証", () => {
		it("GitHubリンクが正しいURLを持つ", () => {
			const github = SOCIAL_LINKS.find((link) => link.label === "GitHub");
			expect(github).toBeDefined();
			expect(github?.href).toContain("github.com");
			expect(github?.icon).toBe(Github);
		});

		it("Twitterリンクが正しいURLを持つ", () => {
			const twitter = SOCIAL_LINKS.find((link) => link.label === "Twitter");
			expect(twitter).toBeDefined();
			expect(twitter?.href).toContain("x.com");
			expect(twitter?.icon).toBe(Twitter);
		});

		it("Instagramリンクが正しいURLを持つ", () => {
			const instagram = SOCIAL_LINKS.find((link) => link.label === "Instagram");
			expect(instagram).toBeDefined();
			expect(instagram?.href).toContain("instagram.com");
			expect(instagram?.icon).toBe(Instagram);
		});

		it("全てのリンクが外部リンクとして安全である（https使用）", () => {
			SOCIAL_LINKS.forEach((link) => {
				expect(link.href).toMatch(/^https:\/\//);
			});
		});
	});
});
