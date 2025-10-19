import { describe, expect, expectTypeOf, it } from "vitest";
import { FAVORITES } from "@/constants/favorites";
import type { FavoriteCategory } from "./favorites";

describe("FavoriteCategory型", () => {
	describe("型定義の整合性", () => {
		it("FavoriteCategoryインターフェースが正しいプロパティを持つ", () => {
			const favorite: FavoriteCategory = {
				category: "テストカテゴリー",
				items: ["アイテム1", "アイテム2"],
			};

			expect(favorite).toHaveProperty("category");
			expect(favorite).toHaveProperty("items");
			expect(typeof favorite.category).toBe("string");
			expect(Array.isArray(favorite.items)).toBe(true);
		});

		it("itemsプロパティは文字列の配列である", () => {
			const favorite: FavoriteCategory = {
				category: "食べ物",
				items: ["ラーメン", "寿司"],
			};

			expect(favorite.items.every((item) => typeof item === "string")).toBe(
				true,
			);
		});

		it("空の配列も許容される", () => {
			const favorite: FavoriteCategory = {
				category: "空カテゴリー",
				items: [],
			};

			expect(favorite.items).toEqual([]);
			expect(favorite.items.length).toBe(0);
		});
	});

	describe("定数データの型整合性", () => {
		it("FAVORITES定数がFavoriteCategory[]型に準拠している", () => {
			expect(Array.isArray(FAVORITES)).toBe(true);
			expect(FAVORITES.length).toBeGreaterThan(0);

			FAVORITES.forEach((favorite) => {
				expect(favorite).toHaveProperty("category");
				expect(favorite).toHaveProperty("items");
				expect(typeof favorite.category).toBe("string");
				expect(Array.isArray(favorite.items)).toBe(true);
			});
		});

		it("FAVORITESの各アイテムが文字列配列である", () => {
			FAVORITES.forEach((favorite) => {
				favorite.items.forEach((item) => {
					expect(typeof item).toBe("string");
				});
			});
		});

		it("FAVORITESに期待されるカテゴリーが含まれている", () => {
			const categories = FAVORITES.map((f) => f.category);
			expect(categories).toContain("Tottenham Hotspur FC");
			expect(categories).toContain("食べ物");
		});

		it("各カテゴリーに少なくとも1つのアイテムが存在する", () => {
			FAVORITES.forEach((favorite) => {
				expect(favorite.items.length).toBeGreaterThan(0);
			});
		});
	});

	describe("TypeScript型チェック", () => {
		it("FavoriteCategoryの型が正しく推論される", () => {
			const favorite: FavoriteCategory = {
				category: "スポーツ",
				items: ["サッカー"],
			};

			expectTypeOf(favorite).toMatchTypeOf<FavoriteCategory>();
			expectTypeOf(favorite.category).toBeString();
			expectTypeOf(favorite.items).toBeArray();
			expectTypeOf(favorite.items).items.toBeString();
		});

		it("FAVORITES配列の型が正しい", () => {
			expectTypeOf(FAVORITES).toBeArray();
			expectTypeOf(FAVORITES).items.toMatchTypeOf<FavoriteCategory>();
		});
	});

	describe("データの実際の値の検証", () => {
		it("Tottenham Hotspur FCカテゴリーに正しいアイテムが含まれている", () => {
			const tottenham = FAVORITES.find(
				(f) => f.category === "Tottenham Hotspur FC",
			);
			expect(tottenham).toBeDefined();
			expect(tottenham?.items).toContain("Son Heung-Min");
			expect(tottenham?.items).toContain("Harry Kane");
		});

		it("食べ物カテゴリーに正しいアイテムが含まれている", () => {
			const food = FAVORITES.find((f) => f.category === "食べ物");
			expect(food).toBeDefined();
			expect(food?.items).toContain("タコス");
			expect(food?.items).toContain("ラーメン");
			expect(food?.items).toContain("ハンバーガー");
		});
	});
});
