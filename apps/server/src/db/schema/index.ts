import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	email: text("email").notNull().unique(),
	name: text("name"),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

// Posts table
export const posts = sqliteTable("posts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	content: text("content"),
	excerpt: text("excerpt"),
	coverImage: text("cover_image"),
	tags: text("tags"),
	views: integer("views").default(0),
	authorId: integer("author_id").references(() => users.id),
	published: integer("published").default(0),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

// View logs table (for deduplication of view counts)
export const viewLogs = sqliteTable("view_logs", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	ipAddress: text("ip_address").notNull(),
	viewedAt: integer("viewed_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});
