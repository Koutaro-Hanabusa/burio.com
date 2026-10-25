PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`excerpt` text,
	`cover_image` text,
	`tags` text,
	`views` integer DEFAULT 0,
	`author_id` integer,
	`published` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "title", "slug", "content", "excerpt", "cover_image", "tags", "views", "author_id", "published", "created_at", "updated_at") SELECT "id", "title", "slug", "content", "excerpt", "cover_image", "tags", "views", "author_id", "published", "created_at", "updated_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "name", "created_at", "updated_at") SELECT "id", "email", "name", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);