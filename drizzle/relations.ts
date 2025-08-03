import { relations } from "drizzle-orm/relations";
import { users as user, favoriteModels, chats, chatShares, dailyTokenUsage, tokenUsageMetrics, messages, sessions as session, accounts as account, presets, polarUsageEvents, presetUsage } from "../lib/db/schema";

export const favoriteModelsRelations = relations(favoriteModels, ({ one }) => ({
	user: one(user, {
		fields: [favoriteModels.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({ one, many }) => ({
	favoriteModels: many(favoriteModels),
	chatShares: many(chatShares),
	dailyTokenUsages: many(dailyTokenUsage),
	tokenUsageMetrics: many(tokenUsageMetrics),
	sessions: many(session),
	accounts: many(account),
	preset: one(presets, {
		fields: [user.defaultPresetId],
		references: [presets.id],
		relationName: "user_defaultPresetId_presets_id"
	}),
	polarUsageEvents: many(polarUsageEvents),
	presets: many(presets, {
		relationName: "presets_userId_user_id"
	}),
	presetUsages: many(presetUsage),
}));

export const chatSharesRelations = relations(chatShares, ({ one }) => ({
	chat: one(chats, {
		fields: [chatShares.chatId],
		references: [chats.id]
	}),
	user: one(user, {
		fields: [chatShares.ownerUserId],
		references: [user.id]
	}),
}));

export const chatsRelations = relations(chats, ({ many }) => ({
	chatShares: many(chatShares),
	tokenUsageMetrics: many(tokenUsageMetrics),
	messages: many(messages),
}));

export const dailyTokenUsageRelations = relations(dailyTokenUsage, ({ one }) => ({
	user: one(user, {
		fields: [dailyTokenUsage.userId],
		references: [user.id]
	}),
}));

export const tokenUsageMetricsRelations = relations(tokenUsageMetrics, ({ one }) => ({
	user: one(user, {
		fields: [tokenUsageMetrics.userId],
		references: [user.id]
	}),
	chat: one(chats, {
		fields: [tokenUsageMetrics.chatId],
		references: [chats.id]
	}),
	message: one(messages, {
		fields: [tokenUsageMetrics.messageId],
		references: [messages.id]
	}),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
	tokenUsageMetrics: many(tokenUsageMetrics),
	chat: one(chats, {
		fields: [messages.chatId],
		references: [chats.id]
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const presetsRelations = relations(presets, ({ one, many }) => ({
	users: many(user, {
		relationName: "user_defaultPresetId_presets_id"
	}),
	user: one(user, {
		fields: [presets.userId],
		references: [user.id],
		relationName: "presets_userId_user_id"
	}),
	presetUsages: many(presetUsage),
}));

export const polarUsageEventsRelations = relations(polarUsageEvents, ({ one }) => ({
	user: one(user, {
		fields: [polarUsageEvents.userId],
		references: [user.id]
	}),
}));

export const presetUsageRelations = relations(presetUsage, ({ one }) => ({
	preset: one(presets, {
		fields: [presetUsage.presetId],
		references: [presets.id]
	}),
	user: one(user, {
		fields: [presetUsage.userId],
		references: [user.id]
	}),
}));