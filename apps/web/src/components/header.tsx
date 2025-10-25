import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fadeInVariants, smoothTransition } from "@/constants/animations";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const links = [
		{ to: "/", label: "Home" },
		{ to: "/blog", label: "Blog" },
	] as const;

	return (
		<motion.header
			className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
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
						src="/logo.png"
						alt="burio.com logo"
						className="h-10 w-10 sm:h-12 sm:w-12"
						whileHover={{ scale: 1.05, rotate: 5 }}
						transition={{ type: "spring", stiffness: 300 }}
					/>
					<span className="font-bold text-lg text-primary sm:text-xl">
						burio.com
					</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden items-center gap-6 md:flex">
					{links.map(({ to, label }) => (
						<Link
							key={to}
							to={to}
							className="font-medium text-foreground/80 text-sm transition-colors hover:text-foreground [&.active]:text-primary"
							activeProps={{
								className: "active text-primary font-semibold",
							}}
						>
							{label}
						</Link>
					))}
					<ModeToggle />
				</nav>

				{/* Mobile Menu Button */}
				<div className="flex items-center gap-2 md:hidden">
					<ModeToggle />
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
						aria-expanded={mobileMenuOpen}
					>
						{mobileMenuOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</Button>
				</div>
			</div>

			{/* Mobile Navigation */}
			{mobileMenuOpen && (
				<motion.div
					className="border-t bg-background md:hidden"
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
								className="font-medium text-base text-foreground/80 transition-colors hover:text-foreground [&.active]:text-primary"
								activeProps={{
									className: "active text-primary font-semibold",
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
