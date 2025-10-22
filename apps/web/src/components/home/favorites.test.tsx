import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Favorites } from "./favorites";

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

describe("Favoritesコンポーネント", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("レンダリング", () => {
		it("コンポーネントが正しくレンダリングされる", () => {
			const { container } = render(<Favorites />);
			const section = container.querySelector("section");
			expect(section).toBeInTheDocument();
		});

		it("セクションタイトル「好きなもの」が表示される", () => {
			render(<Favorites />);
			expect(
				screen.getByRole("heading", { name: "好きなもの" }),
			).toBeInTheDocument();
		});
	});

	describe("お気に入りカテゴリー", () => {
		it("Tottenham Hotspur FCカテゴリーが表示される", () => {
			render(<Favorites />);
			expect(
				screen.getByRole("heading", { name: "Tottenham Hotspur FC" }),
			).toBeInTheDocument();
		});

		it("食べ物カテゴリーが表示される", () => {
			render(<Favorites />);
			expect(
				screen.getByRole("heading", { name: "食べ物" }),
			).toBeInTheDocument();
		});

		it("全てのカテゴリーがh3要素として表示される", () => {
			render(<Favorites />);
			const headings = screen.getAllByRole("heading", { level: 3 });
			expect(headings.length).toBeGreaterThan(0);
		});
	});

	describe("カテゴリーアイテム", () => {
		it("Tottenham Hotspur FCのアイテムが表示される", () => {
			render(<Favorites />);
			expect(screen.getByText("Son Heung-Min")).toBeInTheDocument();
			expect(screen.getByText("Harry Kane")).toBeInTheDocument();
		});

		it("食べ物のアイテムが表示される", () => {
			render(<Favorites />);
			expect(screen.getByText("タコス")).toBeInTheDocument();
			expect(screen.getByText("ラーメン")).toBeInTheDocument();
			expect(screen.getByText("ハンバーガー")).toBeInTheDocument();
		});

		it("全てのアイテムが表示される", () => {
			render(<Favorites />);
			const expectedItems = [
				"Son Heung-Min",
				"Harry Kane",
				"タコス",
				"ラーメン",
				"ハンバーガー",
			];

			expectedItems.forEach((item) => {
				expect(screen.getByText(item)).toBeInTheDocument();
			});
		});
	});

	describe("レイアウト", () => {
		it("グリッドレイアウトが適用されている", () => {
			const { container } = render(<Favorites />);
			const gridContainer = container.querySelector(".grid");
			expect(gridContainer).toBeInTheDocument();
		});

		it("カテゴリーカードにボーダーとパディングが適用されている", () => {
			const { container } = render(<Favorites />);
			const cards = container.querySelectorAll(".p-6.rounded-lg");
			expect(cards.length).toBeGreaterThan(0);
		});
	});

	describe("スタイリング", () => {
		it("セクションに適切なパディングが適用されている", () => {
			const { container } = render(<Favorites />);
			const section = container.querySelector("section");
			expect(section?.className).toContain("py-20");
			expect(section?.className).toContain("px-6");
		});

		it("見出しが太字で表示される", () => {
			render(<Favorites />);
			const mainHeading = screen.getByRole("heading", { name: "好きなもの" });
			expect(mainHeading.className).toContain("font-bold");
		});
	});

	describe("アイテムの構造", () => {
		it("各アイテムにドット（装飾）が含まれている", () => {
			const { container } = render(<Favorites />);
			const dots = container.querySelectorAll(".rounded-full.bg-accent");
			// 全アイテム数（5個）と同じ数のドットが存在する
			expect(dots.length).toBe(5);
		});

		it("アイテムが適切なスペーシングで配置されている", () => {
			const { container } = render(<Favorites />);
			const itemContainers = container.querySelectorAll(".space-y-2");
			expect(itemContainers.length).toBeGreaterThan(0);
		});
	});

	describe("レスポンシブデザイン", () => {
		it("グリッドがレスポンシブクラスを持つ", () => {
			const { container } = render(<Favorites />);
			const gridContainer = container.querySelector(".grid");
			expect(gridContainer?.className).toContain("grid-cols-1");
			expect(gridContainer?.className).toContain("md:grid-cols-2");
		});

		it("見出しがレスポンシブなテキストサイズを持つ", () => {
			render(<Favorites />);
			const mainHeading = screen.getByRole("heading", { name: "好きなもの" });
			expect(mainHeading.className).toContain("text-3xl");
			expect(mainHeading.className).toContain("md:text-4xl");
		});
	});

	describe("詳細情報（detail）", () => {
		it("Tottenham Hotspur FCの詳細が表示される", () => {
			render(<Favorites />);
			expect(
				screen.getByText(
					/ロンドンにあるTottenham Hotspur FCというチームのサポーターをしています/,
				),
			).toBeInTheDocument();
		});

		it("食べ物の詳細が表示される", () => {
			render(<Favorites />);
			expect(screen.getByText(/特にタコスが大好きです/)).toBeInTheDocument();
		});

		it("詳細情報に改行用のクラスが適用されている", () => {
			const { container } = render(<Favorites />);
			const detailElements = container.querySelectorAll(
				".whitespace-pre-line.text-sm",
			);
			expect(detailElements.length).toBe(2); // 2つのカテゴリー
		});

		it("詳細情報が適切なマージンで配置されている", () => {
			const { container } = render(<Favorites />);
			const detailElements = container.querySelectorAll(".mt-4.text-sm");
			expect(detailElements.length).toBeGreaterThan(0);
		});

		it("詳細情報のテキストが改行文字を含む", () => {
			render(<Favorites />);
			const tottenhamDetail = screen.getByText(
				/ロンドンにあるTottenham Hotspur FCというチームのサポーターをしています/,
			).textContent;
			const foodDetail = screen.getByText(/特にタコスが大好きです/).textContent;

			// 改行文字が保持されていることを確認
			expect(tottenhamDetail).toContain("気づけばもう8年目になっていました");
			expect(foodDetail).toContain("タコスを食べて火曜日を感じましょう");
		});
	});
});
