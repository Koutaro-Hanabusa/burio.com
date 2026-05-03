import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fadeInVariants, smoothTransition } from "@/constants/animations";

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const links = [
		{ to: "/", label: "Home" },
		{ to: "/blog", label: "Blog" },
	] as const;

	return (
		<motion.header
			className="fixed top-0 z-50 w-full border-white/20 border-b bg-black backdrop-blur supports-[backdrop-filter]:bg-black/95 dark:border-black/20 dark:bg-white dark:supports-[backdrop-filter]:bg-white/95"
			initial="hidden"
			animate="visible"
			variants={fadeInVariants}
			transition={smoothTransition}
		>
			<div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<Link
					to="/"
					className="flex items-center gap-2 transition-opacity hover:opacity-80"
					aria-label="Home"
				>
					<motion.img
						src="/burio.com_transparent.svg"
						alt="burio16.com logo"
						className="h-10 w-10 sm:h-12 sm:w-12"
						whileHover={{ scale: 1.05, rotate: 5 }}
						transition={{ type: "spring", stiffness: 300 }}
					/>
					<span className="font-bold text-lg text-white sm:text-xl dark:text-black">
						burio16.com
					</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden items-center gap-6 md:flex">
					{links.map(({ to, label }) => (
						<Link
							key={to}
							to={to}
							className="font-medium text-sm text-white/80 transition-colors hover:text-white dark:text-black/80 dark:hover:text-black [&.active]:font-semibold [&.active]:text-white dark:[&.active]:text-black"
							activeProps={{
								className: "active font-semibold",
							}}
						>
							{label}
						</Link>
					))}
				</nav>

				{/* Mobile Menu Button */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
					className="text-white hover:bg-white/10 md:hidden dark:text-black dark:hover:bg-black/10"
				>
					{mobileMenuOpen ? (
						<X className="h-5 w-5" />
					) : (
						<Menu className="h-5 w-5" />
					)}
				</Button>
			</div>

			{/* Mobile Navigation */}
			{mobileMenuOpen && (
				<motion.div
					className="border-white/20 border-t bg-black md:hidden dark:border-black/20 dark:bg-white"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.2 }}
				>
					<nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
						{links.map(({ to, label }) => (
							<Link
								key={to}
								to={to}
								className="font-medium text-base text-white/80 transition-colors hover:text-white dark:text-black/80 dark:hover:text-black [&.active]:font-semibold [&.active]:text-white dark:[&.active]:text-black"
								activeProps={{
									className: "active font-semibold",
								}}
								onClick={() => setMobileMenuOpen(false)}
							>
								{label}
							</Link>
						))}
					</nav>
				</motion.div>
			)}
		</motion.header>
	);
}
