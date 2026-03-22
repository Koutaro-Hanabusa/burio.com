CREATE TABLE `view_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`ip_address` text NOT NULL,
	`viewed_at` integer,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_view_logs_dedup` ON `view_logs`(`post_id`, `ip_address`, `viewed_at`);
