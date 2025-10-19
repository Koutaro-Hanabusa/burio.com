import { describe, expect, it } from "vitest";
import { formatDate } from "./date";

describe("formatDate", () => {
	describe("正常系", () => {
		it("Dateオブジェクトを渡した場合、日本語形式の日付文字列を返す", () => {
			const date = new Date("2024-01-15T12:00:00Z");
			const result = formatDate(date);
			expect(result).toBe("2024年1月15日");
		});

		it("ISO文字列を渡した場合、日本語形式の日付文字列を返す", () => {
			const isoString = "2024-03-20T10:30:00Z";
			const result = formatDate(isoString);
			expect(result).toBe("2024年3月20日");
		});

		it("タイムスタンプ文字列を渡した場合、日本語形式の日付文字列を返す", () => {
			const timestamp = "2024-12-25";
			const result = formatDate(timestamp);
			expect(result).toBe("2024年12月25日");
		});

		it("年末年始の日付を正しくフォーマットする", () => {
			const newYear = formatDate("2024-01-01");
			const newYearsEve = formatDate("2024-12-31");
			expect(newYear).toBe("2024年1月1日");
			expect(newYearsEve).toBe("2024年12月31日");
		});
	});

	describe("エッジケース", () => {
		it("過去の日付を正しくフォーマットする", () => {
			const pastDate = formatDate("2000-06-15");
			expect(pastDate).toBe("2000年6月15日");
		});

		it("未来の日付を正しくフォーマットする", () => {
			const futureDate = formatDate("2030-09-10");
			expect(futureDate).toBe("2030年9月10日");
		});

		it("閏年の2月29日を正しくフォーマットする", () => {
			const leapDay = formatDate("2024-02-29");
			expect(leapDay).toBe("2024年2月29日");
		});

		it("一桁の月と日を正しくフォーマットする", () => {
			const singleDigit = formatDate("2024-1-5");
			expect(singleDigit).toBe("2024年1月5日");
		});
	});

	describe("異常系", () => {
		it("無効な日付文字列を渡した場合、Invalid Dateを返す", () => {
			const result = formatDate("invalid-date");
			expect(result).toContain("Invalid Date");
		});

		it("空文字列を渡した場合、Invalid Dateを返す", () => {
			const result = formatDate("");
			expect(result).toContain("Invalid Date");
		});

		it("存在しない日付（例: 2月30日）を渡した場合、自動的に補正される", () => {
			// JavaScriptのDateは無効な日付を自動的に補正する
			// 2024-02-30 は 2024-03-01 になる
			const result = formatDate("2024-02-30");
			expect(result).toBe("2024年3月1日");
		});
	});

	describe("ロケール確認", () => {
		it("日本語ロケール（ja-JP）でフォーマットされることを確認", () => {
			const date = new Date("2024-05-10");
			const result = formatDate(date);
			// 日本語フォーマットには「年」「月」「日」が含まれる
			expect(result).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
		});

		it("異なる月の日付が正しい日本語フォーマットで返される", () => {
			const months = [
				{ date: "2024-01-01", expected: "2024年1月1日" },
				{ date: "2024-02-15", expected: "2024年2月15日" },
				{ date: "2024-03-30", expected: "2024年3月30日" },
				{ date: "2024-04-20", expected: "2024年4月20日" },
				{ date: "2024-05-05", expected: "2024年5月5日" },
				{ date: "2024-06-10", expected: "2024年6月10日" },
				{ date: "2024-07-25", expected: "2024年7月25日" },
				{ date: "2024-08-15", expected: "2024年8月15日" },
				{ date: "2024-09-09", expected: "2024年9月9日" },
				{ date: "2024-10-31", expected: "2024年10月31日" },
				{ date: "2024-11-11", expected: "2024年11月11日" },
				{ date: "2024-12-24", expected: "2024年12月24日" },
			];

			months.forEach(({ date, expected }) => {
				expect(formatDate(date)).toBe(expected);
			});
		});
	});
});
