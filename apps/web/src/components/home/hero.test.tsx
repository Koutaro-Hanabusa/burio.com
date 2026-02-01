import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hero } from "./hero";

// framer-motionをモック
vi.mock("framer-motion", () => ({
	motion: new Proxy(
		{},
		{
			get:
				(_target, prop) =>
				// biome-ignore lint/suspicious/noExplicitAny: test mock
				({ children, ...props }: any) => {
					const Component = prop as keyof React.JSX.IntrinsicElements;
					return React.createElement(Component as string, props, children);
				},
		},
	),
}));

describe("Heroコンポーネント", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("レンダリング", () => {
		it("コンポーネントが正しくレンダリングされる", () => {
			const { container } = render(<Hero />);
			const section = container.querySelector("section");
			expect(section).toBeInTheDocument();
		});

		it("名前「ぶりお」が表示される", () => {
			render(<Hero />);
			// 3つの文字がそれぞれ表示されることを確認
			expect(screen.getByText("ぶ")).toBeInTheDocument();
			expect(screen.getByText("り")).toBeInTheDocument();
			expect(screen.getByText("お")).toBeInTheDocument();
		});

		it("職業「WEBエンジニア」が表示される", () => {
			render(<Hero />);
			expect(screen.getByText("WEBエンジニア")).toBeInTheDocument();
		});

		it("自己紹介文が表示される", () => {
			render(<Hero />);
			expect(
				screen.getByText(/文系学部からほぼ未経験でエンジニアとして/),
			).toBeInTheDocument();
			expect(
				screen.getByText(/最近はフロントエンドエンジニアを志し日々勉強中/),
			).toBeInTheDocument();
		});

		it("千株式会社へのリンクが表示される", () => {
			render(<Hero />);
			const link = screen.getByRole("link", { name: /千株式会社/ });
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute("href", "https://sencorp.co.jp/");
		});
	});

	describe("SNSリンク", () => {
		it("GitHubリンクが正しく表示される", () => {
			render(<Hero />);
			const githubLink = screen.getByLabelText("GitHub");
			expect(githubLink).toBeInTheDocument();
			expect(githubLink).toHaveAttribute(
				"href",
				"https://github.com/Koutaro-Hanabusa?tab=repositories",
			);
			expect(githubLink).toHaveAttribute("target", "_blank");
			expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
		});

		it("Twitterリンクが正しく表示される", () => {
			render(<Hero />);
			const twitterLink = screen.getByLabelText("Twitter");
			expect(twitterLink).toBeInTheDocument();
			expect(twitterLink).toHaveAttribute("href", "https://x.com/burio_16");
			expect(twitterLink).toHaveAttribute("target", "_blank");
			expect(twitterLink).toHaveAttribute("rel", "noopener noreferrer");
		});

		it("Instagramリンクが正しく表示される", () => {
			render(<Hero />);
			const instagramLink = screen.getByLabelText("Instagram");
			expect(instagramLink).toBeInTheDocument();
			expect(instagramLink.getAttribute("href")).toContain("instagram.com");
			expect(instagramLink).toHaveAttribute("target", "_blank");
			expect(instagramLink).toHaveAttribute("rel", "noopener noreferrer");
		});

		it("全てのSNSリンクが安全な属性を持つ", () => {
			render(<Hero />);
			const links = screen.getAllByRole("link").filter((link) => {
				const label = link.getAttribute("aria-label");
				return (
					label === "GitHub" || label === "Twitter" || label === "Instagram"
				);
			});

			expect(links.length).toBe(3);

			links.forEach((link) => {
				expect(link).toHaveAttribute("target", "_blank");
				expect(link).toHaveAttribute("rel", "noopener noreferrer");
			});
		});
	});

	describe("アクセシビリティ", () => {
		it("各SNSリンクに適切なaria-labelが設定されている", () => {
			render(<Hero />);
			expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
			expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
			expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
		});

		it("セクション要素が存在する", () => {
			const { container } = render(<Hero />);
			const section = container.querySelector("section");
			expect(section).toBeInTheDocument();
		});
	});

	describe("スタイリング", () => {
		it("レスポンシブクラスが適用されている", () => {
			const { container } = render(<Hero />);
			const section = container.querySelector("section");
			expect(section?.className).toContain("min-h-screen");
			expect(section?.className).toContain("flex");
			expect(section?.className).toContain("items-center");
			expect(section?.className).toContain("justify-center");
		});
	});
});
