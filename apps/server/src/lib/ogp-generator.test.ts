import { describe, expect, it } from "vitest";
import { generateOGPImage } from "./ogp-generator";

describe("OGP Image Generator", () => {
	it("should generate OGP image with default options", async () => {
		const result = await generateOGPImage({
			title: "Test Blog Post Title",
		});

		expect(result).toHaveProperty("svg");
		expect(result).toHaveProperty("contentType");
		expect(result.contentType).toBe("image/svg+xml");
		expect(result.svg).toContain("<svg");
		expect(result.svg).toContain("Test Blog Post Title");
	});

	it("should generate OGP image with custom site name", async () => {
		const result = await generateOGPImage({
			title: "Custom Title Test",
			siteName: "Custom Site",
		});

		expect(result.svg).toContain("Custom Title Test");
		expect(result.svg).toContain("Custom Site");
	});

	it("should generate OGP image with Japanese characters", async () => {
		const result = await generateOGPImage({
			title: "日本語のブログタイトルのテスト",
			siteName: "burio16.com",
		});

		expect(result.svg).toContain("日本語のブログタイトルのテスト");
		expect(result.svg).toContain("burio16.com");
	});

	it("should generate OGP image with custom dimensions", async () => {
		const result = await generateOGPImage({
			title: "Test with custom size",
			width: 800,
			height: 400,
		});

		expect(result.svg).toContain('width="800"');
		expect(result.svg).toContain('height="400"');
	});
});
