import { timestamp, pgTable, text, primaryKey, json, boolean, integer, unique, check, index, numeric, date } from "drizzle-orm/pg-core";
import { sql, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// Message role enum type
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  TOOL = "tool"
}

export const chats = pgTable('chats', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull(),
  title: text('title').notNull().default('New Chat'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // user, assistant, or tool
  parts: json('parts').notNull(), // Store parts as JSON in the database
  hasWebSearch: boolean('has_web_search').default(false),
  webSearchContextSize: text('web_search_context_size').default('medium'), // 'low', 'medium', 'high'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types for structured message content
export type MessagePart = {
  type: string;
  text?: string;
  toolCallId?: string;
  toolName?: string;
  args?: any;
  result?: any;
  citations?: WebSearchCitation[];
  [key: string]: any;
};

export type Attachment = {
  type: string;
  [key: string]: any;
};

export type Chat = typeof chats.$inferSelect;
export type ChatWithShareInfo = Chat & {
  shareId?: string | null;
  sharePath?: string | null;
};
export type Message = typeof messages.$inferSelect;
export type DBMessage = {
  id: string;
  chatId: string;
  role: string;
  parts: MessagePart[];
  createdAt: Date;
};

// --- Better Auth Core Schema ---

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: boolean("emailVerified"),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").default(false),
  role: text("role").default("user"),
  isAdmin: boolean("is_admin").default(false),
  metadata: json("metadata"),
  defaultPresetId: text("default_preset_id"), // Will add foreign key constraint in migration
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("providerId").notNull(), // e.g., "google", "github", "email"
    accountId: text("accountId").notNull(), // The user's ID with the provider or email/password hash
    providerType: text("providerType"), // "oauth", "email", etc. REMOVED .notNull()
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
    tokenType: text("token_type"), // e.g., "bearer"
    scope: text("scope"),
    idToken: text("id_token"), // For OIDC providers like Google
    sessionState: text("session_state"), // For OIDC providers

    // Fields specific to email/password - not needed for Google-only
    // password: text("password"),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  }
);

export const sessions = pgTable("session", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  sessionToken: text("sessionToken").unique().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Corrected Verification Token Schema -> Renamed Verification Schema
export const verification = pgTable( // Renamed from verificationTokens
  "verification", // Renamed from verificationToken
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    identifier: text("identifier").notNull(),
    // token: text("token").unique().notNull(), // Removed this line
    value: text("value").notNull(), // Ensure this exists as per docs (though error wasn't about this)
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  }
);

// --- End Better Auth Core Schema ---

// Infer types for Better Auth tables
export type AuthUser = typeof users.$inferSelect;
export type AuthAccount = typeof accounts.$inferSelect;
export type AuthSession = typeof sessions.$inferSelect;
// export type AuthVerificationToken = typeof verificationTokens.$inferSelect; // Removed old type export
export type AuthVerification = typeof verification.$inferSelect; // Added new type export

export type WebSearchCitation = {
  url: string;
  title: string;
  content?: string;
  startIndex: number;
  endIndex: number;
};

// --- Polar Usage Events Schema ---

export const polarUsageEvents = pgTable('polar_usage_events', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()), // Unique ID for the log entry
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Links to your existing users table
  polarCustomerId: text('polar_customer_id'), // The customer ID from Polar
  eventName: text('event_name').notNull(), // The name of the event (e.g., "ai-usage")
  eventPayload: json('event_payload').notNull(), // The full payload sent to Polar's ingest API (e.g., { "completionTokens": 100 })
  createdAt: timestamp('created_at').defaultNow().notNull(), // When this log entry was created
});

export type PolarUsageEvent = typeof polarUsageEvents.$inferSelect;

// --- Presets Schema ---

export const presets = pgTable('presets', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  modelId: text('model_id').notNull(),
  systemInstruction: text('system_instruction').notNull(),
  temperature: integer('temperature').notNull(), // Store as integer (temperature * 1000) for precision
  maxTokens: integer('max_tokens').notNull(),
  webSearchEnabled: boolean('web_search_enabled').default(false),
  webSearchContextSize: text('web_search_context_size').default('medium'), // 'low', 'medium', 'high'
  apiKeyPreferences: json('api_key_preferences').$type<Record<string, { useCustomKey: boolean; keyName?: string }>>().default({}),
  isDefault: boolean('is_default').default(false),
  shareId: text('share_id').unique(),
  visibility: text('visibility').default('private'), // 'private', 'shared'
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  // Constraints
  uniqueNamePerUser: unique('unique_name_per_user').on(table.userId, table.name),
  // oneDefaultPerUser constraint removed - handled in application logic
  checkNameLength: check('check_name_length', sql`char_length(${table.name}) >= 1 AND char_length(${table.name}) <= 100`),
  checkSystemInstructionLength: check('check_system_instruction_length', sql`char_length(${table.systemInstruction}) >= 10 AND char_length(${table.systemInstruction}) <= 4000`),
  checkTemperatureRange: check('check_temperature_range', sql`${table.temperature} >= 0 AND ${table.temperature} <= 2000`), // 0.0 to 2.0 * 1000
  checkMaxTokensRange: check('check_max_tokens_range', sql`${table.maxTokens} > 0 AND ${table.maxTokens} <= 200000`),
  checkVisibility: check('check_visibility', sql`${table.visibility} IN ('private', 'shared')`),
  checkWebSearchContextSize: check('check_web_search_context_size', sql`${table.webSearchContextSize} IN ('low', 'medium', 'high')`),
  checkShareIdFormat: check('check_share_id_format', sql`${table.shareId} IS NULL OR (char_length(${table.shareId}) >= 20 AND char_length(${table.shareId}) <= 50)`),
}));

// Preset usage tracking
export const presetUsage = pgTable('preset_usage', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  presetId: text('preset_id').notNull().references(() => presets.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  chatId: text('chat_id'),
  usedAt: timestamp('used_at').defaultNow().notNull(),
});

export type Preset = typeof presets.$inferSelect;
export type PresetInsert = typeof presets.$inferInsert;
export type PresetUsage = typeof presetUsage.$inferSelect;

// --- Favorite Models Schema ---

export const favoriteModels = pgTable('favorite_models', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  modelId: text('model_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Ensure one favorite per user per model
  uniqueUserModel: unique('unique_user_model').on(table.userId, table.modelId),
  // Indexes for performance
  userIdIdx: index('idx_favorite_models_user_id').on(table.userId),
  modelIdIdx: index('idx_favorite_models_model_id').on(table.modelId),
}));

export type FavoriteModel = typeof favoriteModels.$inferSelect;
export type FavoriteModelInsert = typeof favoriteModels.$inferInsert;

// --- Chat Shares Schema ---

export const chatShares = pgTable('chat_shares', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  ownerUserId: text('owner_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  shareId: text('share_id').notNull().unique(),
  status: text('status').notNull().default('active'),
  visibility: text('visibility').notNull().default('unlisted'),
  snapshotJson: json('snapshot_json').notNull(),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
}, (table) => ({
  // Constraints and indexes
  checkStatus: check('check_chat_shares_status', sql`${table.status} IN ('active','revoked')`),
  checkVisibility: check('check_chat_shares_visibility', sql`${table.visibility} IN ('unlisted')`),
  checkShareIdFormat: check('check_chat_shares_share_id_format', sql`char_length(${table.shareId}) >= 20 AND char_length(${table.shareId}) <= 64`),
  chatStatusIdx: index('idx_chat_shares_chat_id_status').on(table.chatId, table.status),
  ownerStatusIdx: index('idx_chat_shares_owner_user_id_status').on(table.ownerUserId, table.status),
}));

export type ChatShare = typeof chatShares.$inferSelect;
export type ChatShareInsert = typeof chatShares.$inferInsert;

// --- Token Usage Metrics Schema ---

export const tokenUsageMetrics = pgTable('token_usage_metrics', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  messageId: text('message_id').references(() => messages.id, { onDelete: 'cascade' }), // Made nullable
  modelId: text('model_id').notNull(),
  provider: text('provider').notNull(),
  inputTokens: integer('input_tokens').default(0).notNull(),
  outputTokens: integer('output_tokens').default(0).notNull(),
  totalTokens: integer('total_tokens').default(0).notNull(),
  estimatedCost: numeric('estimated_cost', { precision: 10, scale: 6 }).default('0').notNull(),
  actualCost: numeric('actual_cost', { precision: 10, scale: 6 }),
  currency: text('currency').default('USD').notNull(),
  processingTimeMs: integer('processing_time_ms'),
  timeToFirstTokenMs: integer('time_to_first_token_ms'),
  tokensPerSecond: numeric('tokens_per_second', { precision: 10, scale: 2 }),
  streamingStartTime: timestamp('streaming_start_time'),
  status: text('status').default('completed').notNull(),
  errorMessage: text('error_message'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Constraints
  checkStatus: check('check_token_usage_metrics_status', sql`${table.status} IN ('pending', 'processing', 'completed', 'failed')`),
  checkTokensNonNegative: check('check_token_usage_metrics_tokens_non_negative', sql`${table.inputTokens} >= 0 AND ${table.outputTokens} >= 0 AND ${table.totalTokens} >= 0`),
  checkCostNonNegative: check('check_token_usage_metrics_cost_non_negative', sql`${table.estimatedCost} >= 0 AND (${table.actualCost} IS NULL OR ${table.actualCost} >= 0)`),
  // Indexes
  userIdIdx: index('idx_token_usage_metrics_user_id').on(table.userId),
  chatIdIdx: index('idx_token_usage_metrics_chat_id').on(table.chatId),
  modelIdIdx: index('idx_token_usage_metrics_model_id').on(table.modelId),
  providerIdx: index('idx_token_usage_metrics_provider').on(table.provider),
  createdAtIdx: index('idx_token_usage_metrics_created_at').on(table.createdAt),
  statusIdx: index('idx_token_usage_metrics_status').on(table.status),
  // NEW: Composite indexes for cost calculation performance
  userCreatedAtIdx: index('idx_token_usage_metrics_user_created_at').on(table.userId, table.createdAt),
  userProviderCreatedAtIdx: index('idx_token_usage_metrics_user_provider_created_at').on(table.userId, table.provider, table.createdAt),
  modelProviderIdx: index('idx_token_usage_metrics_model_provider').on(table.modelId, table.provider),
}));

export const modelPricing = pgTable('model_pricing', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  modelId: text('model_id').notNull(),
  provider: text('provider').notNull(),
  inputTokenPrice: numeric('input_token_price', { precision: 10, scale: 6 }).notNull(),
  outputTokenPrice: numeric('output_token_price', { precision: 10, scale: 6 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  effectiveFrom: timestamp('effective_from').defaultNow().notNull(),
  effectiveTo: timestamp('effective_to'),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Constraints
  checkPricesPositive: check('check_model_pricing_prices_positive', sql`${table.inputTokenPrice} >= 0 AND ${table.outputTokenPrice} >= 0`),
  // Indexes - Conditional unique constraint for active entries only
  // This allows historical pricing entries while ensuring only one active entry per model+provider
  // Note: The actual constraint is created via SQL migration due to Drizzle ORM limitations with conditional constraints
  providerIdx: index('idx_model_pricing_provider').on(table.provider),
  effectiveFromIdx: index('idx_model_pricing_effective_from').on(table.effectiveFrom),
  // NEW: Add missing indexes for performance
  modelIdIdx: index('idx_model_pricing_model_id').on(table.modelId),
  isActiveIdx: index('idx_model_pricing_is_active').on(table.isActive),
  // Composite index for the most common query pattern
  modelProviderActiveIdx: index('idx_model_pricing_model_provider_active').on(table.modelId, table.provider, table.isActive),
  // NEW: Optimized composite index for batch pricing queries
  modelProviderActiveEffectiveIdx: index('idx_model_pricing_model_provider_active_effective').on(table.modelId, table.provider, table.isActive, table.effectiveFrom),
  // NEW: Partial index for active pricing only (most common query)
  activePricingIdx: index('idx_model_pricing_active_only').on(table.modelId, table.provider, table.effectiveFrom).where(sql`${table.isActive} = true`),
}));

export const dailyTokenUsage = pgTable('daily_token_usage', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  provider: text('provider').notNull(),
  totalInputTokens: integer('total_input_tokens').default(0).notNull(),
  totalOutputTokens: integer('total_output_tokens').default(0).notNull(),
  totalTokens: integer('total_tokens').default(0).notNull(),
  totalEstimatedCost: numeric('total_estimated_cost', { precision: 10, scale: 6 }).default('0').notNull(),
  totalActualCost: numeric('total_actual_cost', { precision: 10, scale: 6 }).default('0').notNull(),
  requestCount: integer('request_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Constraints
  uniqueUserDateProvider: unique('daily_token_usage_user_id_date_provider_idx').on(table.userId, table.date, table.provider),
  checkTokensNonNegative: check('check_daily_token_usage_tokens_non_negative', sql`${table.totalInputTokens} >= 0 AND ${table.totalOutputTokens} >= 0 AND ${table.totalTokens} >= 0`),
  checkCostNonNegative: check('check_daily_token_usage_cost_non_negative', sql`${table.totalEstimatedCost} >= 0 AND ${table.totalActualCost} >= 0`),
  // Indexes
  dateIdx: index('idx_daily_token_usage_date').on(table.date),
  // NEW: Add missing indexes for performance
  userIdIdx: index('idx_daily_token_usage_user_id').on(table.userId),
  providerIdx: index('idx_daily_token_usage_provider').on(table.provider),
  // Composite index for the most common query pattern
  userDateProviderIdx: index('idx_daily_token_usage_user_date_provider').on(table.userId, table.date, table.provider),
}));

// --- Usage Limits Schema ---

export const usageLimits = pgTable('usage_limits', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // null for global limits
  modelId: text('model_id'), // null for user-specific limits
  provider: text('provider'), // null for user-specific limits
  dailyTokenLimit: integer('daily_token_limit').notNull(),
  monthlyTokenLimit: integer('monthly_token_limit').notNull(),
  dailyCostLimit: numeric('daily_cost_limit', { precision: 10, scale: 2 }).notNull(),
  monthlyCostLimit: numeric('monthly_cost_limit', { precision: 10, scale: 2 }).notNull(),
  requestRateLimit: integer('request_rate_limit').default(60).notNull(), // requests per minute
  currency: text('currency').default('USD').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Constraints
  checkLimitsPositive: check('check_usage_limits_positive', sql`${table.dailyTokenLimit} >= 0 AND ${table.monthlyTokenLimit} >= 0 AND ${table.dailyCostLimit} >= 0 AND ${table.monthlyCostLimit} >= 0 AND ${table.requestRateLimit} >= 1`),
  checkUserOrModel: check('check_usage_limits_user_or_model', sql`(${table.userId} IS NOT NULL) OR (${table.modelId} IS NOT NULL AND ${table.provider} IS NOT NULL)`),
  // Indexes
  userIdIdx: index('idx_usage_limits_user_id').on(table.userId),
  modelIdIdx: index('idx_usage_limits_model_id').on(table.modelId),
  providerIdx: index('idx_usage_limits_provider').on(table.provider),
  isActiveIdx: index('idx_usage_limits_is_active').on(table.isActive),
  createdAtIdx: index('idx_usage_limits_created_at').on(table.createdAt),
}));

// Token usage metrics types
export type TokenUsageMetrics = typeof tokenUsageMetrics.$inferSelect;
export type TokenUsageMetricsInsert = typeof tokenUsageMetrics.$inferInsert;
export type ModelPricing = typeof modelPricing.$inferSelect;
export type ModelPricingInsert = typeof modelPricing.$inferInsert;
export type DailyTokenUsage = typeof dailyTokenUsage.$inferSelect;
export type DailyTokenUsageInsert = typeof dailyTokenUsage.$inferInsert;
export type UsageLimit = typeof usageLimits.$inferSelect;
export type UsageLimitInsert = typeof usageLimits.$inferInsert;

