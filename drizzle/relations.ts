import { relations } from "drizzle-orm/relations";
import { user, favoriteModels, chats, chatShares, dailyTokenUsage, tokenUsageMetrics, messages, session, account, polarUsageEvents, presets, presetUsage } from "./schema";

export const favoriteModelsRelations = relations(favoriteModels, ({one}) => ({
	user: one(user, {
		fields: [favoriteModels.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	favoriteModels: many(favoriteModels),
	chatShares: many(chatShares),
	dailyTokenUsages: many(dailyTokenUsage),
	tokenUsageMetrics: many(tokenUsageMetrics),
	sessions: many(session),
	accounts: many(account),
	polarUsageEvents: many(polarUsageEvents),
	presets: many(presets),
	presetUsages: many(presetUsage),
}));

export const chatSharesRelations = relations(chatShares, ({one}) => ({
	chat: one(chats, {
		fields: [chatShares.chatId],
		references: [chats.id]
	}),
	user: one(user, {
		fields: [chatShares.ownerUserId],
		references: [user.id]
	}),
}));

export const chatsRelations = relations(chats, ({many}) => ({
	chatShares: many(chatShares),
	tokenUsageMetrics: many(tokenUsageMetrics),
	messages: many(messages),
}));

export const dailyTokenUsageRelations = relations(dailyTokenUsage, ({one}) => ({
	user: one(user, {
		fields: [dailyTokenUsage.userId],
		references: [user.id]
	}),
}));

export const tokenUsageMetricsRelations = relations(tokenUsageMetrics, ({one}) => ({
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

export const messagesRelations = relations(messages, ({one, many}) => ({
	tokenUsageMetrics: many(tokenUsageMetrics),
	chat: one(chats, {
		fields: [messages.chatId],
		references: [chats.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const polarUsageEventsRelations = relations(polarUsageEvents, ({one}) => ({
	user: one(user, {
		fields: [polarUsageEvents.userId],
		references: [user.id]
	}),
}));

export const presetsRelations = relations(presets, ({one, many}) => ({
	user: one(user, {
		fields: [presets.userId],
		references: [user.id]
	}),
	presetUsages: many(presetUsage),
}));

export const presetUsageRelations = relations(presetUsage, ({one}) => ({
	preset: one(presets, {
		fields: [presetUsage.presetId],
		references: [presets.id]
	}),
	user: one(user, {
		fields: [presetUsage.userId],
		references: [user.id]
	}),
}));