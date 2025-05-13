import { timestamp, pgTable, text, primaryKey, json, boolean, integer } from "drizzle-orm/pg-core";
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
  metadata: json("metadata"),
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