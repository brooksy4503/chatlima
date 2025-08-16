# Implementation Plan: Database Changes for Model Display Feature

## Overview
This document details the specific database changes required to implement the model display feature, including schema updates, migration scripts, and type definitions.

## Current Database Schema
The current `messages` table schema in `lib/db/schema.ts`:

```typescript
export const messages = pgTable('messages', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // user, assistant, or tool
  parts: json('parts').notNull(), // Store parts as JSON in the database
  hasWebSearch: boolean('has_web_search').default(false),
  webSearchContextSize: text('web_search_context_size').default('medium'), // 'low', 'medium', 'high'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## Required Changes

### 1. Schema Update
Add a new column to store the model ID used for each message:

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

### 2. Type Definition Updates
Update the TypeScript types to include the new field:

```typescript
export type Message = typeof messages.$inferSelect;

// The DBMessage type needs to be updated to include modelId
export type DBMessage = {
  id: string;
  chatId: string;
  role: string;
  parts: MessagePart[];
  modelId?: string; // NEW: Optional model ID
  createdAt: Date;
};
```

### 3. Drizzle Migration Generation
Use Drizzle Kit to automatically generate the migration:

1. **Update the schema file first**
   - Modify `lib/db/schema.ts` to add the `modelId` column

2. **Generate the migration**
   - Run: `pnpm db:generate` 
   - This will automatically create a new migration file in the `drizzle` directory
   - The file will be named with a timestamp and descriptive name like `0041_add_model_id_to_messages.sql`

3. **Review the generated migration**
   - Check the generated SQL to ensure it matches expectations
   - The migration will contain the ALTER TABLE statement and any necessary indexes

### 4. Apply the Migration
Run the migration to update the database:

- Execute: `pnpm db:migrate` to apply the changes to the database

## Backward Compatibility Considerations

### Existing Data
- Existing messages will have NULL values for the `model_id` column
- This is acceptable as we only need to track model information for new messages
- UI should handle cases where model information is missing gracefully

### Application Code
- The `modelId` field is optional in the TypeScript types
- This allows existing code to continue working without modification
- New code can take advantage of the additional field

## Testing Plan

### 1. Schema Validation
- Verify that the new column exists in the database
- Confirm that the column allows NULL values
- Check that existing data remains intact

### 2. Data Insertion Testing
- Test inserting new messages with model information
- Verify that model information is stored correctly
- Test inserting messages without model information (should work as before)

### 3. Data Retrieval Testing
- Test querying messages with model information
- Verify that existing queries still work
- Check that the new field is properly populated in query results

### 4. Migration Process Testing
- Test the generate and migrate process in development environment
- Verify that the migration can be applied successfully
- Check that rollback works if needed

## Performance Considerations

### Indexing
- Consider adding an index on the `model_id` column if we plan to query by model frequently
- The index would help with analytics or filtering by model
- This can be added in a separate migration if needed

### Storage Impact
- The additional column will have minimal storage impact
- Most model IDs are relatively short strings
- NULL values for existing messages take up no additional space

## Rollout Strategy

### 1. Development Environment
- Implement and test in development environment first
- Verify all functionality works as expected

### 2. Staging Environment
- Deploy to staging environment
- Test with realistic data and usage patterns

### 3. Production Environment
- Deploy during low-traffic period
- Monitor for any issues or performance impacts
- Have rollback plan ready

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate Action**
   - Revert the application code changes if possible
   - Add feature flag to disable the functionality

2. **Database Rollback**
   - If the migration causes issues, roll back the database changes
   - This would involve removing the column (if no data has been written to it)

3. **Monitoring**
   - Monitor application logs for any errors
   - Watch for performance degradation
   - Check that existing functionality remains unaffected