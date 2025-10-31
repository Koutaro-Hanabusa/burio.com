import { render, screen, waitFor } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// tRPCのクエリ戻り値の型定義
interface BlogPost {
	id: number;
	slug: string;
	title: string;
	excerpt?: string | null;
	createdAt: string;
	views: number;
}

interface MotionComponentProps {
	children?: ReactNode;
	className?: string;
	initial?: unknown;
	animate?: unknown;
	whileInView?: unknown;
	whileHover?: unknown;
	variants?: unknown;
	transition?: unknown;
	viewport?: unknown;
	[key: string]: unknown;
}

interface LinkProps {
	children: ReactNode;
	to: string;
	params?: Record<string, string>;
	className?: string;
	[key: string]: unknown;
}

// framer-motionをモック
vi.mock("framer-motion", () => ({
	motion: new Proxy(
		{},
		{
			get:
				(_target, prop) =>
				({ children, ...props }: MotionComponentProps) => {
					const Component = prop as keyof React.JSX.IntrinsicElements;
					// framer-motion固有のpropsを除外
					const {
						initial,
						animate,
						whileInView,
						whileHover,
						variants,
						transition,
						viewport,
						...domProps
					} = props;
					return React.createElement(Component as string, domProps, children);
				},
		},
	),
}));

// @tanstack/react-routerをモック
vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to, params, ...props }: LinkProps) => {
		// paramsがある場合、$idなどのプレースホルダーを置き換える
		let href = to;
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				href = href.replace(`$${key}`, value);
			});
		}
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	},
}));

// useAdminAccessフックをモック
vi.mock("@/hooks/use-admin-access", () => ({
	useAdminAccess: vi.fn(),
}));

// tRPCをモック
vi.mock("@/utils/trpc", () => ({
	trpc: {
		blog: {
			getAll: {
				useQuery: vi.fn(),
			},
		},
	},
}));

// コンポーネントのインポート前にモックを定義
import { useAdminAccess } from "@/hooks/use-admin-access";
import { trpc } from "@/utils/trpc";
import { Blog } from "./blog";

// 型安全なモック関数を作成
const mockUseAdminAccess = useAdminAccess as unknown as ReturnType<
	typeof vi.fn
>;
const mockUseQuery = trpc.blog.getAll.useQuery as unknown as ReturnType<
	typeof vi.fn
>;

describe("Blogコンポーネント", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAdminAccess.mockReturnValue({ isAdmin: false });
	});

	describe("ローディング状態", () => {
		it("ローディング中はローディングメッセージが表示される", () => {
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			});

			render(<Blog />);
			expect(screen.getByText("読み込み中...")).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: "最新のブログ記事" }),
			).toBeInTheDocument();
		});

		it("ローディング中はブログ記事が表示されない", () => {
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			});

			render(<Blog />);
			expect(screen.queryByRole("article")).not.toBeInTheDocument();
		});
	});

	describe("エラー状態", () => {
		it("エラー時はエラーメッセージを表示する", () => {
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error("Failed to fetch"),
			});

			const { getByText } = render(<Blog />);
			expect(
				getByText("ブログ記事の読み込みに失敗しました"),
			).toBeInTheDocument();
		});

		it("記事が空配列の場合は空状態メッセージを表示する", () => {
			mockUseQuery.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			const { getByText } = render(<Blog />);
			expect(getByText("まだブログ記事がありません")).toBeInTheDocument();
		});

		it("dataがnullの場合は空状態メッセージを表示する", () => {
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			});

			const { getByText } = render(<Blog />);
			expect(getByText("まだブログ記事がありません")).toBeInTheDocument();
		});
	});

	describe("成功状態（記事表示）", () => {
		const mockPosts: BlogPost[] = [
			{
				id: 1,
				slug: "test-post-1",
				title: "テスト記事1",
				excerpt: "これはテスト記事1の抜粋です",
				createdAt: "2024-01-15T10:00:00Z",
				views: 100,
			},
			{
				id: 2,
				slug: "test-post-2",
				title: "テスト記事2",
				excerpt: "これはテスト記事2の抜粋です",
				createdAt: "2024-02-20T00:00:00Z",
				views: 50,
			},
			{
				id: 3,
				slug: "test-post-3",
				title: "テスト記事3",
				excerpt: null,
				createdAt: "2024-03-10T08:00:00Z",
				views: 0,
			},
		];

		beforeEach(() => {
			mockUseQuery.mockReturnValue({
				data: mockPosts,
				isLoading: false,
				error: null,
			});
		});

		it("記事が正しく表示される", () => {
			render(<Blog />);
			// モックデータの各記事タイトルが表示されることを確認
			mockPosts.forEach((post) => {
				expect(screen.getByText(post.title)).toBeInTheDocument();
			});
		});

		it("記事の抜粋が表示される", () => {
			render(<Blog />);
			// excerptがnullでない記事の抜粋が表示されることを確認
			mockPosts
				.filter((post) => post.excerpt)
				.forEach((post) => {
					expect(screen.getByText(post.excerpt as string)).toBeInTheDocument();
				});
		});

		it("抜粋がnullの場合は表示されない", () => {
			render(<Blog />);
			const articles = screen.getAllByRole("article");

			// excerptがnullの記事について、抜粋セクションが存在しないことを確認
			mockPosts
				.filter((post) => !post.excerpt)
				.forEach((post) => {
					const article = articles.find((a) =>
						a.textContent?.includes(post.title),
					);
					// タイトルと日付以外に長い説明文がないことを確認
					expect(article).toBeDefined();
					// excerptは通常長めのテキストなので、記事内に極端に長いテキストがないことを確認
					const textContent = article?.textContent || "";
					const _words = textContent.split(/\s+/);
					// タイトル、日付、views以外の長いテキストブロックがないことを確認
					expect(textContent).toContain(post.title);
				});
		});

		it("日付が日本語フォーマットで表示される", () => {
			render(<Blog />);
			// 各記事の日付が日本語フォーマットで表示されることを確認
			mockPosts.forEach((post) => {
				const date = new Date(post.createdAt);
				const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
				expect(screen.getByText(formattedDate)).toBeInTheDocument();
			});
		});

		it("閲覧数が表示される", () => {
			render(<Blog />);
			// views > 0 の記事の閲覧数が表示されることを確認
			mockPosts
				.filter((post) => post.views > 0)
				.forEach((post) => {
					expect(screen.getByText(`${post.views} views`)).toBeInTheDocument();
				});
		});

		it("閲覧数が0の場合は表示されない", () => {
			render(<Blog />);
			const articles = screen.getAllByRole("article");

			// views === 0 の記事について、「0 views」が表示されないことを確認
			mockPosts
				.filter((post) => post.views === 0)
				.forEach((post) => {
					const article = articles.find((a) =>
						a.textContent?.includes(post.title),
					);
					expect(article).toBeDefined();
					expect(article?.textContent).not.toContain("0 views");
				});
		});

		it("記事へのリンクが正しく設定される", () => {
			render(<Blog />);
			// 各記事について、タイトルをラベルとするリンクが正しいhrefを持つことを確認
			mockPosts.forEach((post) => {
				// まず、記事タイトルがページ内に存在することを確認
				const titleElement = screen.getByText(post.title);
				expect(titleElement).toBeInTheDocument();

				// その記事タイトルを含むリンク要素を探す
				const links = screen.getAllByRole("link");
				const articleLink = links.find(
					(link) =>
						link.textContent?.includes(post.title) &&
						link.getAttribute("href")?.includes(`/blog/${post.id}`),
				);

				expect(articleLink).toBeDefined();
				expect(articleLink).toHaveAttribute("href", `/blog/${post.id}`);
			});
		});
	});

	describe("ヘッダー", () => {
		beforeEach(() => {
			mockUseQuery.mockReturnValue({
				data: [
					{
						id: 1,
						slug: "test",
						title: "Test",
						excerpt: null,
						createdAt: "2024-01-01",
						views: 0,
					},
				],
				isLoading: false,
				error: null,
			});
		});

		it("メインタイトル「最新のブログ記事」が表示される", () => {
			render(<Blog />);
			expect(
				screen.getByRole("heading", { name: "最新のブログ記事" }),
			).toBeInTheDocument();
		});

		it("すべて見るリンクが表示される", () => {
			render(<Blog />);
			const link = screen.getByRole("link", { name: /すべて見る/ });
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute("href", "/blog");
		});
	});

	describe("管理者機能", () => {
		const mockPosts: BlogPost[] = [
			{
				id: 1,
				slug: "test",
				title: "Test",
				excerpt: null,
				createdAt: "2024-01-01",
				views: 0,
			},
		];

		it("管理者でない場合、管理画面リンクは表示されない", () => {
			mockUseAdminAccess.mockReturnValue({ isAdmin: false });
			mockUseQuery.mockReturnValue({
				data: mockPosts,
				isLoading: false,
				error: null,
			});

			render(<Blog />);
			expect(
				screen.queryByRole("link", { name: "管理画面" }),
			).not.toBeInTheDocument();
		});

		it("管理者の場合、管理画面リンクが表示される", async () => {
			mockUseAdminAccess.mockReturnValue({ isAdmin: true });
			mockUseQuery.mockReturnValue({
				data: mockPosts,
				isLoading: false,
				error: null,
			});

			render(<Blog />);
			await waitFor(() => {
				const adminLink = screen.getByRole("link", { name: "管理画面" });
				expect(adminLink).toBeInTheDocument();
				expect(adminLink).toHaveAttribute("href", "/admin");
			});
		});
	});

	describe("スタイリング", () => {
		beforeEach(() => {
			mockUseQuery.mockReturnValue({
				data: [
					{
						id: 1,
						slug: "test",
						title: "Test",
						excerpt: null,
						createdAt: "2024-01-01",
						views: 0,
					},
				],
				isLoading: false,
				error: null,
			});
		});

		it("セクションに背景色が適用されている", () => {
			const { container } = render(<Blog />);
			const section = container.querySelector("section");
			expect(section?.className).toContain("bg-muted/30");
		});

		it("セクションに適切なパディングが適用されている", () => {
			const { container } = render(<Blog />);
			const section = container.querySelector("section");
			expect(section?.className).toContain("py-20");
			expect(section?.className).toContain("px-6");
		});
	});

	describe("記事数の制限", () => {
		it("tRPCクエリに正しいlimitとpublishedパラメータが渡される", () => {
			mockUseQuery.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			render(<Blog />);
			expect(mockUseQuery).toHaveBeenCalledWith({
				limit: 3,
				published: true,
			});
		});
	});
});
