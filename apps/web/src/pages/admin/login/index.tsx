import { useState } from "react";
import { RiGithubFill } from "react-icons/ri";
import { auth } from "void/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Props } from "./index.server";

export default function AdminLoginPage({ authError }: Props) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState(authError);

	async function signIn() {
		setPending(true);
		setError(false);
		try {
			const result = await auth.signIn.social({
				provider: "github",
				callbackURL: "/admin",
				errorCallbackURL: "/admin/login",
			});
			if (result.error) setError(true);
		} catch {
			setError(true);
		} finally {
			setPending(false);
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">管理者ログイン</CardTitle>
					<CardDescription>
						GitHub アカウントでログインしてください。
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button className="w-full" disabled={pending} onClick={signIn}>
						<RiGithubFill aria-hidden="true" />
						{pending ? "GitHub に移動しています…" : "GitHub でログイン"}
					</Button>
					{error && (
						<p role="alert" className="text-destructive text-sm">
							ログインできませんでした。利用する GitHub
							アカウントを確認してください。
						</p>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
