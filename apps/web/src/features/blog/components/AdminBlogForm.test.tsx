import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { AdminBlogForm } from "./AdminBlogForm";

afterEach(() => vi.unstubAllGlobals());

function pendingUpload() {
	let resolve: (response: Response) => void = () => {};
	const response = new Promise<Response>((done) => {
		resolve = done;
	});
	vi.stubGlobal(
		"fetch",
		vi.fn(() => response),
	);
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
		callback(0);
		return 1;
	});
	return resolve;
}

function pasteImage(textarea: HTMLTextAreaElement) {
	const file = new File(["image"], "sample.png", { type: "image/png" });
	fireEvent.paste(textarea, {
		clipboardData: {
			items: [{ type: "image/png", getAsFile: () => file }],
		},
	});
}

describe("AdminBlogForm image upload", () => {
	it.each([
		["success", true],
		["failure", false],
	])("keeps text typed during delayed upload (%s)", async (_case, success) => {
		const resolve = pendingUpload();
		render(<AdminBlogForm mode="new" headingText="新しい記事" />);
		const textarea = screen.getByRole<HTMLTextAreaElement>("textbox", {
			name: /本文/,
		});
		fireEvent.change(textarea, { target: { value: "before " } });
		textarea.setSelectionRange(7, 7);
		pasteImage(textarea);
		const placeholder = "![Uploading sample.png...]()";
		await waitFor(() => expect(textarea.value).toBe(`before ${placeholder}`));
		fireEvent.change(textarea, {
			target: { value: `before ${placeholder} after` },
		});
		resolve(
			new Response(
				JSON.stringify(success ? { url: "/image.png" } : { error: "failed" }),
				{ status: success ? 200 : 500 },
			),
		);
		await waitFor(() =>
			expect(textarea.value).toBe(
				success ? "before ![sample.png](/image.png) after" : "before  after",
			),
		);
	});
});
