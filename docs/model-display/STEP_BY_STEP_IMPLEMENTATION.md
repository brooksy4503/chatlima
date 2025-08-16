# Step-by-Step Implementation: Model Display Feature

## Overview
This document provides exact step-by-step instructions to implement the model display feature in ChatLima.

## Prerequisites
- Ensure your development environment is set up and running
- Make sure you can run `pnpm db:generate` and `pnpm db:migrate`
- Have access to the PostgreSQL database

## Implementation Steps

### Step 1: Update Database Schema

1. Open `lib/db/schema.ts`

2. Find the `messages` table definition (around line 20)

3. Add the `modelId` column:
   ```typescript
   export const messages = pgTable('messages', {
     id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
     chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
     role: text('role').notNull(), // user, assistant, or tool
     parts: json('parts').notNull(), // Store parts as JSON in the database
     hasWebSearch: boolean('has_web_search').default(false),
     webSearchContextSize: text('web_search_context_size').default('medium'), // 'low', 'medium', 'high'
     modelId: text('model_id'), // NEW: Store the model ID used for this message
     createdAt: timestamp('created_at').defaultNow().notNull(),
   });
   ```

4. Update the `DBMessage` type (around line 53):
   ```typescript
   export type DBMessage = {
     id: string;
     chatId: string;
     role: string;
     parts: MessagePart[];
     modelId?: string; // NEW: Optional model ID
     createdAt: Date;
   };
   ```

### Step 2: Generate and Apply Database Migration

1. Generate the migration:
   ```bash
   pnpm db:generate
   ```

2. Review the generated migration file in the `drizzle` directory

3. Apply the migration:
   ```bash
   pnpm db:migrate
   ```

### Step 3: Update Chat Store Functions

1. Open `lib/chat-store.ts`

2. Update the `UIMessage` type (around line 18):
   ```typescript
   type UIMessage = {
     id: string;
     role: string;
     content: string;
     parts: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
     createdAt?: Date;
     hasWebSearch?: boolean;
     webSearchContextSize?: 'low' | 'medium' | 'high';
     modelId?: string; // NEW: Add modelId to UI message type
   };
   ```

3. Update the `convertToUIMessages` function (around line 116):
   ```typescript
   // Convert DB messages to UI format
   export function convertToUIMessages(dbMessages: Array<Message>): Array<UIMessage> {
     return dbMessages.map((message) => ({
       id: message.id,
       parts: message.parts as Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>,
       role: message.role as string,
       content: getTextContent(message), // For backward compatibility
       createdAt: message.createdAt,
       hasWebSearch: message.hasWebSearch || false,
       webSearchContextSize: (message.webSearchContextSize || 'medium') as 'low' | 'medium' | 'high',
       modelId: message.modelId // NEW: Include modelId in UI messages
     }));
   }
   ```

4. Update the `convertToDBMessages` function (around line 67):
   ```typescript
   // Function to convert AI messages to DB format
   export function convertToDBMessages(aiMessages: AIMessage[], chatId: string, selectedModel?: string): DBMessage[] {
     return aiMessages.map(msg => {
       // Use existing id or generate a new one
       const messageId = msg.id || nanoid();
   
       // If msg has parts, use them directly
       if (msg.parts) {
         return {
           id: messageId,
           chatId,
           role: msg.role,
           parts: msg.parts,
           hasWebSearch: msg.hasWebSearch || false,
           webSearchContextSize: msg.webSearchContextSize || 'medium',
           modelId: msg.role === 'assistant' ? selectedModel : undefined, // NEW: Add modelId for assistant messages
           createdAt: new Date()
         };
       }
   
       // Otherwise, convert content to parts
       let parts: Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
   
       if (typeof msg.content === 'string') {
         parts = [{ type: 'text', text: msg.content } as TextUIPart];
       } else if (Array.isArray(msg.content)) {
         if (msg.content.every(item => typeof item === 'object' && item !== null)) {
           // Content is already in parts-like format
           parts = msg.content as Array<TextUIPart | ToolInvocationUIPart | ImageUIPart | ReasoningUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
         } else {
           // Content is an array but not in parts format
           parts = [{ type: 'text', text: JSON.stringify(msg.content) } as TextUIPart];
         }
       } else {
         // Default case
         parts = [{ type: 'text', text: String(msg.content) } as TextUIPart];
       }
   
       return {
         id: messageId,
         chatId,
         role: msg.role,
         parts,
         hasWebSearch: msg.hasWebSearch || false,
         webSearchContextSize: msg.webSearchContextSize || 'medium',
         modelId: msg.role === 'assistant' ? selectedModel : undefined, // NEW: Add modelId for assistant messages
         createdAt: new Date()
       };
     });
   }
   ```

### Step 4: Update API Route

1. Open `app/api/chat/route.ts`

2. Find where `convertToDBMessages` is called (search for "convertToDBMessages")

3. Update the call to pass the selected model:
   ```typescript
   const dbMessages = convertToDBMessages(processedMessages as any, id, selectedModel);
   ```

### Step 5: Update Message Component

1. Open `components/message.tsx`

2. Find the section where messages are rendered (look for the main return statement with message display)

3. Add the model display code for assistant messages:
   ```tsx
   {/* Display model information for assistant messages */}
   {message.role === 'assistant' && message.modelId && (
     <div className="text-xs text-muted-foreground mt-2 flex items-center">
       <span className="bg-muted px-2 py-1 rounded-md text-xs">
         Model: {message.modelId}
       </span>
     </div>
   )}
   ```

   Place this code after the main message content but before the token usage metrics section.

### Step 6: Test the Implementation

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Open the application in your browser

3. Start a new chat and send a message

4. Verify that:
   - The assistant response shows the model name below it
   - The model name matches the one you selected
   - Existing chats still display correctly
   - No errors appear in the console

### Step 7: Verify Database Storage

1. Check the database to confirm model information is stored:
   ```sql
   SELECT id, role, model_id FROM messages WHERE model_id IS NOT NULL LIMIT 5;
   ```

2. Verify that the model_id column contains the expected values

### Troubleshooting

If the model information doesn't display:

1. Check that the database migration was applied successfully
2. Verify that the API route is passing the selectedModel parameter
3. Check the browser console for JavaScript errors
4. Confirm that the message component is receiving the modelId prop

If you encounter database errors:

1. Verify that `pnpm db:migrate` completed successfully
2. Check that the `model_id` column exists in the messages table
3. Ensure that the column allows NULL values

## Completion

Once all steps are completed and tested, the model display feature will be fully implemented. Users will see which AI model was used to generate each assistant message, providing transparency into the AI models being used in ChatLima.