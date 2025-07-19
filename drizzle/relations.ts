import { relations } from "drizzle-orm/relations";
import { user, session, account, chats, messages, polarUsageEvents, presets } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	polarUsageEvents: many(polarUsageEvents),
	presets: many(presets),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	chat: one(chats, {
		fields: [messages.chatId],
		references: [chats.id]
	}),
}));

export const chatsRelations = relations(chats, ({many}) => ({
	messages: many(messages),
}));

export const polarUsageEventsRelations = relations(polarUsageEvents, ({one}) => ({
	user: one(user, {
		fields: [polarUsageEvents.userId],
		references: [user.id]
	}),
}));

export const presetsRelations = relations(presets, ({one}) => ({
	user: one(user, {
		fields: [presets.userId],
		references: [user.id]
	}),
}));