import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
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
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	content: text("content"),
	excerpt: text("excerpt"),
	coverImage: text("cover_image"),
	tags: text("tags"),
	views: integer("views").default(0),
	authorId: text("author_id").references(() => users.id),
	published: integer("published").default(0),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});
