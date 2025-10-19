import { render, screen, waitFor } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// tRPCのクエリ戻り値の型定義
interface BlogPost {
	slug: string;
	title: string;
	excerpt?: string | null;
	createdAt: string;
	views: number;
}

interface UseQueryResult<TData = unknown, TError = unknown> {
	data: TData | undefined;
	isLoading: boolean;
	error: TError | null;
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
					return React.createElement(Component as string, props, children);
				},
		},
	),
}));

// @tanstack/react-routerをモック
vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to, ...props }: LinkProps) => (
		<a href={to} {...props}>
			{children}
		</a>
	),
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

const mockUseAdminAccess = useAdminAccess as any;
const mockUseQuery = trpc.blog.getAll.useQuery as any;

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
		it("エラー時はnullを返す（何も表示しない）", () => {
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error("Failed to fetch"),
			});

			const { container } = render(<Blog />);
			expect(container.firstChild).toBeNull();
		});

		it("記事が空配列の場合はnullを返す", () => {
			mockUseQuery.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			const { container } = render(<Blog />);
			expect(container.firstChild).toBeNull();
		});

		it("dataがnullの場合はnullを返す", () => {
			mockUseQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			});

			const { container } = render(<Blog />);
			expect(container.firstChild).toBeNull();
		});
	});

	describe("成功状態（記事表示）", () => {
		const mockPosts: BlogPost[] = [
			{
				slug: "test-post-1",
				title: "テスト記事1",
				excerpt: "これはテスト記事1の抜粋です",
				createdAt: "2024-01-15T10:00:00Z",
				views: 100,
			},
			{
				slug: "test-post-2",
				title: "テスト記事2",
				excerpt: "これはテスト記事2の抜粋です",
				createdAt: "2024-02-20T00:00:00Z",
				views: 50,
			},
			{
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
			expect(screen.getByText("テスト記事1")).toBeInTheDocument();
			expect(screen.getByText("テスト記事2")).toBeInTheDocument();
			expect(screen.getByText("テスト記事3")).toBeInTheDocument();
		});

		it("記事の抜粋が表示される", () => {
			render(<Blog />);
			expect(
				screen.getByText("これはテスト記事1の抜粋です"),
			).toBeInTheDocument();
			expect(
				screen.getByText("これはテスト記事2の抜粋です"),
			).toBeInTheDocument();
		});

		it("抜粋がnullの場合は表示されない", () => {
			render(<Blog />);
			// テスト記事3は抜粋がnullなので、対応する抜粋テキストは存在しない
			const articles = screen.getAllByRole("article");
			const article3 = articles.find((article) =>
				article.textContent?.includes("テスト記事3"),
			);
			expect(article3?.textContent).not.toContain("抜粋");
		});

		it("日付が日本語フォーマットで表示される", () => {
			render(<Blog />);
			expect(screen.getByText("2024年1月15日")).toBeInTheDocument();
			expect(screen.getByText("2024年2月20日")).toBeInTheDocument();
			expect(screen.getByText("2024年3月10日")).toBeInTheDocument();
		});

		it("閲覧数が表示される", () => {
			render(<Blog />);
			expect(screen.getByText("100 views")).toBeInTheDocument();
			expect(screen.getByText("50 views")).toBeInTheDocument();
		});

		it("閲覧数が0の場合は表示されない", () => {
			render(<Blog />);
			const articles = screen.getAllByRole("article");
			const article3 = articles.find((article) =>
				article.textContent?.includes("テスト記事3"),
			);
			expect(article3?.textContent).not.toContain("0 views");
		});

		it("記事へのリンクが正しく設定される", () => {
			render(<Blog />);
			const link1 = screen.getByRole("link", { name: "テスト記事1" });
			const link2 = screen.getByRole("link", { name: "テスト記事2" });
			expect(link1).toHaveAttribute("href", "/blog/test-post-1");
			expect(link2).toHaveAttribute("href", "/blog/test-post-2");
		});
	});

	describe("ヘッダー", () => {
		beforeEach(() => {
			mockUseQuery.mockReturnValue({
				data: [
					{
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
