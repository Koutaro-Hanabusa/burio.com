ALTER TABLE `posts` ADD `slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `excerpt` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `cover_image` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `views` integer DEFAULT 0;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);