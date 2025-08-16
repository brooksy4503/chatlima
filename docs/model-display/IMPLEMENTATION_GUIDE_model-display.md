# Implementation Guide: Model Display Feature

## Overview
This guide provides step-by-step instructions for implementing the model display feature in ChatLima, which will show which AI model was used to generate each assistant message.

## Prerequisites
- Node.js and pnpm installed
- PostgreSQL database running
- ChatLima development environment set up
- Basic familiarity with TypeScript, React, and Drizzle ORM

## Implementation Steps

### Step 1: Update Database Schema

1. **Modify the messages table schema**
   - Open `lib/db/schema.ts`
   - Add the `modelId` column to the messages table:
   
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

2. **Update the DBMessage type**
   - In the same file, update the DBMessage type:
   
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

### Step 2: Generate Database Migration

1. **Generate the migration**
   ```bash
   pnpm db:generate
   ```
   
   This will create a new migration file in the `drizzle` directory with a timestamp prefix.

2. **Review the generated migration**
   - Check the generated SQL to ensure it correctly adds the `model_id` column
   - The migration should contain an ALTER TABLE statement similar to:
   
   ```sql
   ALTER TABLE messages ADD COLUMN model_id text;
   ```

### Step 3: Apply Database Migration

1. **Run the migration**
   ```bash
   pnpm db:migrate
   ```
   
   This will apply the schema changes to your database.

### Step 4: Update Chat Store Functions

1. **Update the UIMessage type**
   - Open `lib/chat-store.ts`
   - Update the UIMessage type to include modelId:
   
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

2. **Update convertToUIMessages function**
   - In the same file, update the convertToUIMessages function to include modelId:
   
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

### Step 5: Update API Route to Store Model Information

1. **Modify the chat API route**
   - Open `app/api/chat/route.ts`
   - Find where messages are processed and saved
   - Update the message creation logic to include the selected model

2. **Update convertToDBMessages function**
   - In `lib/chat-store.ts`, update the convertToDBMessages function:
   
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

3. **Update the saveChat function calls**
   - In the API route, ensure that when messages are saved, the selected model is passed:
   
   ```typescript
   // When saving chat, pass the selectedModel to convertToDBMessages
   const dbMessages = convertToDBMessages(processedMessages as any, id, selectedModel);
   ```

### Step 6: Update Message Component to Display Model Information

1. **Modify the message component**
   - Open `components/message.tsx`
   - Find the section where assistant messages are rendered
   - Add UI to display the model information:

   ```tsx
   // In the message rendering section, add model display for assistant messages
   {message.role === 'assistant' && message.modelId && (
     <div className="text-xs text-muted-foreground mt-2 flex items-center">
       <span className="bg-muted px-2 py-1 rounded-md">
         Model: {message.modelId}
       </span>
     </div>
   )}
   ```

2. **Style the model display**
   - The model display should be subtle but visible
   - Consider using a badge-like styling to distinguish it from the main content
   - Ensure it's responsive and works well on mobile devices

### Step 7: Test the Implementation

1. **Test with new messages**
   - Start a new chat and send a message
   - Verify that the model information is displayed for the assistant response
   - Check that the model information is stored in the database

2. **Test backward compatibility**
   - Load existing chats with messages that don't have model information
   - Verify that these messages display correctly without errors
   - Confirm that the UI handles missing model information gracefully

3. **Test different models**
   - Test with different AI models to ensure the correct model name is displayed
   - Verify that model switching works correctly

### Step 8: Handle Edge Cases

1. **Missing model information**
   - Ensure the UI gracefully handles cases where model information is not available
   - This will be the case for existing messages

2. **Long model names**
   - Consider truncating very long model names if they don't fit well in the UI
   - Or use a tooltip to show the full name

3. **Performance considerations**
   - Verify that adding model information doesn't significantly impact performance
   - Check that database queries remain efficient

## Troubleshooting

### Common Issues

1. **Migration fails to apply**
   - Check that the database connection is working
   - Verify that the schema changes are correct
   - Ensure no other migrations are conflicting

2. **Model information not displaying**
   - Check that the modelId is being passed correctly through the data flow
   - Verify that the message component is receiving the model information
   - Check the browser console for any JavaScript errors

3. **Database constraint errors**
   - Ensure that the migration is applied before testing
   - Check that the column allows NULL values for backward compatibility

### Debugging Steps

1. **Check database schema**
   ```sql
   \d messages
   ```
   Verify that the `model_id` column exists.

2. **Check sample data**
   ```sql
   SELECT id, role, model_id FROM messages WHERE model_id IS NOT NULL LIMIT 5;
   ```
   Verify that model information is being stored correctly.

3. **Check application logs**
   - Look for any errors in the console when sending messages
   - Check the network tab to see if API requests are working correctly

## Rollback Procedure

If you need to rollback the changes:

1. **Revert code changes**
   - Undo the changes to `lib/db/schema.ts`
   - Revert changes to `lib/chat-store.ts`
   - Revert changes to `components/message.tsx`

2. **Rollback database migration**
   - If using Drizzle Kit, you can use the migrate down command
   - Or manually remove the column with SQL:
   ```sql
   ALTER TABLE messages DROP COLUMN model_id;
   ```

3. **Test that the application works correctly**
   - Verify that existing functionality is restored
   - Confirm that no errors occur with existing messages

## Performance Monitoring

After deployment, monitor:

1. **Database performance**
   - Check query performance for message retrieval
   - Monitor storage usage

2. **Application performance**
   - Check page load times
   - Monitor memory usage

3. **User feedback**
   - Gather feedback on the model display feature
   - Make adjustments based on user needs

## Next Steps

Once the model display feature is implemented:

1. **Consider adding model information to exports**
   - If you have chat export functionality, consider including model information

2. **Analytics**
   - Consider tracking which models are used most frequently
   - This could help with model selection and optimization

3. **User education**
   - Update documentation to explain the new feature
   - Consider adding tooltips or help text to explain what the model information means