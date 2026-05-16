import { motion } from "framer-motion";
import { useEffect } from "react";
import {
	RiErrorWarningLine,
	RiRefreshLine,
	RiShieldLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

interface AdminGuardProps {
	children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
	const authenticate = trpc.admin.authenticate.useMutation();

	useEffect(() => {
		authenticate.mutate();
		// authenticate を毎マウント 1 度だけ走らせる。useMutation の参照は安定だが
		// 依存配列に入れると無限ループになるため意図的に除外する。
		// biome-ignore lint/correctness/useExhaustiveDependencies: see above
	}, []);

	const isForbidden = authenticate.error?.data?.code === "FORBIDDEN";
	const hasError = authenticate.isError && !isForbidden;
	const isChecking = authenticate.isIdle || authenticate.isPending;

	if (isChecking) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<div className="mb-6">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{
								duration: 2,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
							className="inline-block"
						>
							<RiShieldLine className="mx-auto h-12 w-12 text-primary" />
						</motion.div>
					</div>
					<h2 className="mb-2 font-semibold text-2xl">アクセス確認中...</h2>
					<p className="text-muted-foreground">
						IPアドレスの確認を行っています
					</p>
				</motion.div>
			</div>
		);
	}

	if (isForbidden) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-6">
				<motion.div
					className="w-full max-w-md"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Card className="border-red-500/20 bg-red-500/10">
						<CardHeader className="text-center">
							<div className="mb-4">
								<RiErrorWarningLine className="mx-auto h-16 w-16 text-red-500" />
							</div>
							<CardTitle className="text-red-400">
								管理画面へのアクセスが拒否されました
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3 text-center">
								<p className="text-muted-foreground text-sm">
									許可されたIPアドレスからのみアクセス可能です。
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-6">
				<motion.div
					className="w-full max-w-md"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Card className="border-red-500/20 bg-red-500/10">
						<CardHeader className="text-center">
							<div className="mb-4">
								<RiErrorWarningLine className="mx-auto h-16 w-16 text-red-500" />
							</div>
							<CardTitle className="text-red-400">
								認証中にエラーが発生しました
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-md border border-red-500/20 bg-red-500/10 p-4">
								<p className="text-red-400 text-sm">
									<strong>エラー:</strong> {authenticate.error?.message}
								</p>
							</div>
							<Button
								onClick={() => authenticate.mutate()}
								variant="outline"
								className="w-full"
							>
								<RiRefreshLine className="mr-2 h-4 w-4" />
								再試行
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
	}

	return (
		<>
			<motion.div
				className="bg-green-500 px-4 py-2 text-center text-sm text-white"
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				管理者アクセス許可
			</motion.div>
			{children}
		</>
	);
}
