-- Add web search columns to messages table
ALTER TABLE messages
ADD COLUMN has_web_search boolean DEFAULT false,
ADD COLUMN web_search_context_size text DEFAULT 'medium';

-- Update existing messages to have default values
UPDATE messages 
SET has_web_search = false,
    web_search_context_size = 'medium'
WHERE has_web_search IS NULL; 