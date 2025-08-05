import { pgTable, index, foreignKey, unique, text, timestamp, check, json, integer, numeric, boolean, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const favoriteModels = pgTable("favorite_models", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	modelId: text("model_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_favorite_models_model_id").using("btree", table.modelId.asc().nullsLast().op("text_ops")),
	index("idx_favorite_models_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "favorite_models_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("unique_user_model").on(table.userId, table.modelId),
]);

export const chatShares = pgTable("chat_shares", {
	id: text().primaryKey().notNull(),
	chatId: text("chat_id").notNull(),
	ownerUserId: text("owner_user_id").notNull(),
	shareId: text("share_id").notNull(),
	status: text().default('active').notNull(),
	visibility: text().default('unlisted').notNull(),
	snapshotJson: json("snapshot_json").notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	revokedAt: timestamp("revoked_at", { mode: 'string' }),
}, (table) => [
	index("idx_chat_shares_chat_id_status").using("btree", table.chatId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	index("idx_chat_shares_owner_user_id_status").using("btree", table.ownerUserId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "chat_shares_chat_id_chats_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ownerUserId],
			foreignColumns: [user.id],
			name: "chat_shares_owner_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("chat_shares_share_id_unique").on(table.shareId),
	check("check_chat_shares_status", sql`status = ANY (ARRAY['active'::text, 'revoked'::text])`),
	check("check_chat_shares_visibility", sql`visibility = 'unlisted'::text`),
	check("check_chat_shares_share_id_format", sql`(char_length(share_id) >= 20) AND (char_length(share_id) <= 64)`),
]);

export const modelPricing = pgTable("model_pricing", {
	id: text().primaryKey().notNull(),
	modelId: text("model_id").notNull(),
	provider: text().notNull(),
	inputTokenPrice: numeric("input_token_price", { precision: 10, scale:  6 }).notNull(),
	outputTokenPrice: numeric("output_token_price", { precision: 10, scale:  6 }).notNull(),
	currency: text().default('USD').notNull(),
	effectiveFrom: timestamp("effective_from", { mode: 'string' }).defaultNow().notNull(),
	effectiveTo: timestamp("effective_to", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_model_pricing_effective_from").using("btree", table.effectiveFrom.asc().nullsLast().op("timestamp_ops")),
	index("idx_model_pricing_provider").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	check("check_model_pricing_prices_positive", sql`(input_token_price >= (0)::numeric) AND (output_token_price >= (0)::numeric)`),
]);

export const dailyTokenUsage = pgTable("daily_token_usage", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	date: date().notNull(),
	provider: text().notNull(),
	totalInputTokens: integer("total_input_tokens").default(0).notNull(),
	totalOutputTokens: integer("total_output_tokens").default(0).notNull(),
	totalTokens: integer("total_tokens").default(0).notNull(),
	totalEstimatedCost: numeric("total_estimated_cost", { precision: 10, scale:  6 }).default('0').notNull(),
	totalActualCost: numeric("total_actual_cost", { precision: 10, scale:  6 }).default('0').notNull(),
	requestCount: integer("request_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_daily_token_usage_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "daily_token_usage_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("daily_token_usage_user_id_date_provider_idx").on(table.userId, table.date, table.provider),
	check("check_daily_token_usage_tokens_non_negative", sql`(total_input_tokens >= 0) AND (total_output_tokens >= 0) AND (total_tokens >= 0)`),
	check("check_daily_token_usage_cost_non_negative", sql`(total_estimated_cost >= (0)::numeric) AND (total_actual_cost >= (0)::numeric)`),
]);

export const tokenUsageMetrics = pgTable("token_usage_metrics", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	chatId: text("chat_id").notNull(),
	messageId: text("message_id").notNull(),
	modelId: text("model_id").notNull(),
	provider: text().notNull(),
	inputTokens: integer("input_tokens").default(0).notNull(),
	outputTokens: integer("output_tokens").default(0).notNull(),
	totalTokens: integer("total_tokens").default(0).notNull(),
	estimatedCost: numeric("estimated_cost", { precision: 10, scale:  6 }).default('0').notNull(),
	actualCost: numeric("actual_cost", { precision: 10, scale:  6 }),
	currency: text().default('USD').notNull(),
	processingTimeMs: integer("processing_time_ms"),
	status: text().default('completed').notNull(),
	errorMessage: text("error_message"),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_token_usage_metrics_chat_id").using("btree", table.chatId.asc().nullsLast().op("text_ops")),
	index("idx_token_usage_metrics_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_token_usage_metrics_model_id").using("btree", table.modelId.asc().nullsLast().op("text_ops")),
	index("idx_token_usage_metrics_provider").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	index("idx_token_usage_metrics_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_token_usage_metrics_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "token_usage_metrics_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "token_usage_metrics_chat_id_chats_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "token_usage_metrics_message_id_messages_id_fk"
		}).onDelete("cascade"),
	check("check_token_usage_metrics_status", sql`status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])`),
	check("check_token_usage_metrics_tokens_non_negative", sql`(input_tokens >= 0) AND (output_tokens >= 0) AND (total_tokens >= 0)`),
	check("check_token_usage_metrics_cost_non_negative", sql`(estimated_cost >= (0)::numeric) AND ((actual_cost IS NULL) OR (actual_cost >= (0)::numeric))`),
]);

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
	defaultPresetId: text("default_preset_id"),
	role: text().default('user'),
	isAdmin: boolean("is_admin").default(false),
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
	modelId: text("model_id").notNull(),
	systemInstruction: text("system_instruction").notNull(),
	temperature: integer().notNull(),
	maxTokens: integer("max_tokens").notNull(),
	webSearchEnabled: boolean("web_search_enabled").default(false),
	webSearchContextSize: text("web_search_context_size").default('medium'),
	apiKeyPreferences: json("api_key_preferences").default({}),
	isDefault: boolean("is_default").default(false),
	shareId: text("share_id"),
	visibility: text().default('private'),
	version: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "presets_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("unique_name_per_user").on(table.userId, table.name),
	unique("presets_share_id_unique").on(table.shareId),
	check("check_name_length", sql`(char_length(name) >= 1) AND (char_length(name) <= 100)`),
	check("check_system_instruction_length", sql`(char_length(system_instruction) >= 10) AND (char_length(system_instruction) <= 4000)`),
	check("check_temperature_range", sql`(temperature >= 0) AND (temperature <= 2000)`),
	check("check_max_tokens_range", sql`(max_tokens > 0) AND (max_tokens <= 100000)`),
	check("check_visibility", sql`visibility = ANY (ARRAY['private'::text, 'shared'::text])`),
	check("check_web_search_context_size", sql`web_search_context_size = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])`),
	check("check_share_id_format", sql`(share_id IS NULL) OR ((char_length(share_id) >= 20) AND (char_length(share_id) <= 50))`),
]);

export const presetUsage = pgTable("preset_usage", {
	id: text().primaryKey().notNull(),
	presetId: text("preset_id").notNull(),
	userId: text("user_id").notNull(),
	chatId: text("chat_id"),
	usedAt: timestamp("used_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.presetId],
			foreignColumns: [presets.id],
			name: "preset_usage_preset_id_presets_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "preset_usage_user_id_user_id_fk"
		}).onDelete("cascade"),
]);
