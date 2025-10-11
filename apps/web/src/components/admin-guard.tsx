import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
	const [isChecking, setIsChecking] = useState(true);
	const [accessGranted, setAccessGranted] = useState(false);
	const [ipInfo, setIpInfo] = useState<{
		ip: string;
		allowed: boolean;
		message: string;
	} | null>(null);

	const {
		data: accessCheck,
		isLoading,
		error,
		refetch,
	} = trpc.admin.checkAccess.useQuery(undefined, {
		retry: 1,
		staleTime: 5 * 60 * 1000, // 5分間キャッシュ
	});

	useEffect(() => {
		if (accessCheck) {
			setIpInfo(accessCheck);
			setAccessGranted(accessCheck.allowed);
			setIsChecking(false);
		} else if (error) {
			setIsChecking(false);
		}
	}, [accessCheck, error]);

	const handleRetry = () => {
		setIsChecking(true);
		refetch();
	};

	if (isChecking || isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<div className="mb-6">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
							className="inline-block"
						>
							<RiShieldLine className="h-12 w-12 text-primary mx-auto" />
						</motion.div>
					</div>
					<h2 className="text-2xl font-semibold mb-2">アクセス確認中...</h2>
					<p className="text-muted-foreground">
						IPアドレスの確認を行っています
					</p>
				</motion.div>
			</div>
		);
	}

	if (!accessGranted || error) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-6">
				<motion.div
					className="max-w-md w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Card className="border-red-500/20 bg-red-500/10">
						<CardHeader className="text-center">
							<div className="mb-4">
								<RiErrorWarningLine className="h-16 w-16 text-red-500 mx-auto" />
							</div>
							<CardTitle className="text-red-400">
								管理画面へのアクセスが拒否されました
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{ipInfo && (
								<div className="bg-card p-4 rounded-md border border-border">
									<p className="text-sm text-muted-foreground mb-2">
										<strong>IPアドレス:</strong> {ipInfo.ip}
									</p>
									<p className="text-sm text-muted-foreground">
										<strong>ステータス:</strong> {ipInfo.message}
									</p>
								</div>
							)}

							{error && (
								<div className="bg-red-500/10 p-4 rounded-md border border-red-500/20">
									<p className="text-sm text-red-400">
										<strong>エラー:</strong> {error.message}
									</p>
								</div>
							)}

							<div className="text-center space-y-3">
								<p className="text-sm text-muted-foreground">
									許可されたIPアドレスからのみアクセス可能です。
								</p>
								<Button
									onClick={handleRetry}
									variant="outline"
									className="w-full"
								>
									<RiRefreshLine className="h-4 w-4 mr-2" />
									再試行
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
	}

	// アクセス許可された場合は子コンポーネントを表示
	return (
		<>
			{/* アクセス成功の通知バナー */}
			<motion.div
				className="bg-green-500 text-white px-4 py-2 text-center text-sm"
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				✅ 管理者アクセス許可 (IP: {ipInfo?.ip})
			</motion.div>
			{children}
		</>
	);
}
