import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { action } from "@void/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { VoidActionError } from "void/pages-client";
import { AdminBlogForm } from "./AdminBlogForm";

vi.mock("@void/react", async (importOriginal) => ({
	...(await importOriginal<typeof import("@void/react")>()),
	action: vi.fn(),
}));

afterEach(() => {
	vi.unstubAllGlobals();
	vi.mocked(action).mockReset();
});

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

describe("AdminBlogForm submit", () => {
	it("keeps TanStack field values and blocks duplicate submit while Void action is pending", async () => {
		let resolve: (value: Awaited<ReturnType<typeof action>>) => void = () => {};
		vi.mocked(action).mockImplementation(
			() =>
				new Promise((done) => {
					resolve = done;
				}),
		);
		render(<AdminBlogForm mode="new" headingText="新しい記事" />);
		const title = screen.getByRole<HTMLInputElement>("textbox", {
			name: /タイトル/,
		});
		fireEvent.change(title, { target: { value: "  " } });
		const submit = screen.getByRole<HTMLButtonElement>("button", {
			name: "記事を作成",
		});
		fireEvent.click(submit);
		await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
		expect(submit).toBeDisabled();
		fireEvent.click(submit);
		expect(action).toHaveBeenCalledTimes(1);
		resolve({
			ok: false,
			error: new VoidActionError({
				body: { errors: { title: "タイトルは必須です" } },
				status: 422,
				statusText: "Unprocessable Content",
				url: "/admin/blog/new",
			}),
		});
		await screen.findByText("タイトルは必須です");
		expect(title.value).toBe("  ");
		expect(submit).toBeEnabled();
	});

	it("keeps edits after an unexpected save failure", async () => {
		vi.mocked(action).mockRejectedValue(new Error("保存できませんでした"));
		render(<AdminBlogForm mode="new" headingText="新しい記事" />);
		const title = screen.getByRole<HTMLInputElement>("textbox", {
			name: /タイトル/,
		});
		fireEvent.change(title, { target: { value: "下書き" } });
		fireEvent.click(screen.getByRole("button", { name: "記事を作成" }));
		await screen.findByText("保存できませんでした");
		expect(title.value).toBe("下書き");
	});
});
