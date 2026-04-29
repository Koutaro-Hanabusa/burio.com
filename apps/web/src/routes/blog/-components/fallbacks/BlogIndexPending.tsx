import { motion } from "framer-motion";
import { RiSearchLine } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const BlogIndexPending = () => {
	return (
		<main className="min-h-screen">
			<motion.div
				className="px-6 py-20 md:px-12 lg:px-24"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 space-y-6">
						<h1 className="font-bold text-5xl md:text-6xl">ぶりおの部屋</h1>
						<p className="text-medium text-muted-foreground">
							ルールル　ルルル　ルールル　ルルル　ルー↑ ルー↑↑　ルー↑↑↑
							　ルー↑↑↑↑ ルールルー↑
						</p>
						<p className="text-muted-foreground text-xl">
							サッカーの話、タコスの話、はたまた技術の話など幅広く思ったことを書いていきます。
						</p>

						<div className="relative">
							<RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								type="text"
								placeholder="記事を検索..."
								className="pl-10"
								disabled
							/>
						</div>
					</div>

					<div className="space-y-6">
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-4 rounded-lg border p-6">
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
								<div className="flex gap-4">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
								</div>
							</div>
						))}
					</div>
				</div>
			</motion.div>
		</main>
	);
};
