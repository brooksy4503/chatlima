import { pgTable, foreignKey, unique, text, timestamp, boolean, json, numeric, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	sessionToken: text().notNull(),
	userId: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
	unique("session_sessionToken_unique").on(table.sessionToken),
]);

export const account = pgTable("account", {
	userId: text().notNull(),
	providerId: text().notNull(),
	accountId: text().notNull(),
	providerType: text(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	id: text().primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: boolean(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	isAnonymous: boolean().default(false),
	metadata: json(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const chats = pgTable("chats", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: text().default('New Chat').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	id: text().primaryKey().notNull(),
	chatId: text("chat_id").notNull(),
	role: text().notNull(),
	parts: json().notNull(),
	hasWebSearch: boolean("has_web_search").default(false),
	webSearchContextSize: text("web_search_context_size").default('medium'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "messages_chat_id_chats_id_fk"
		}).onDelete("cascade"),
]);

export const polarUsageEvents = pgTable("polar_usage_events", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	polarCustomerId: text("polar_customer_id"),
	eventName: text("event_name").notNull(),
	eventPayload: json("event_payload").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "polar_usage_events_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const presets = pgTable("presets", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	model: text().notNull(),
	temperature: numeric().default('0.7'),
	maxTokens: integer("max_tokens"),
	systemPrompt: text("system_prompt"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "presets_user_id_user_id_fk"
		}).onDelete("cascade"),
]);
