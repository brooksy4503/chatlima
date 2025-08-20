-- Test script to simulate daily message usage tracking
-- This simulates what should happen when an anonymous user sends a message

-- Create a test user (if not exists)
INSERT INTO "user" (id, email, "isAnonymous", name)
VALUES ('test-user-fix-verification', 'test-fix@example.com', true, 'Test Fix User')
ON CONFLICT (email) DO NOTHING;

-- Simulate incrementing daily usage for today
INSERT INTO daily_message_usage (id, user_id, date, message_count, is_anonymous, last_message_at)
VALUES (
  'test-daily-usage-' || extract(epoch from now()),
  'test-user-fix-verification',
  CURRENT_DATE,
  1,
  true,
  NOW()
)
ON CONFLICT (user_id, date) DO UPDATE SET
  message_count = daily_message_usage.message_count + 1,
  last_message_at = NOW(),
  updated_at = NOW();

-- Check the result
SELECT 
  user_id,
  date,
  message_count,
  is_anonymous,
  last_message_at,
  CASE 
    WHEN is_anonymous THEN 
      CASE WHEN message_count >= 10 THEN 'LIMIT REACHED' ELSE 'WITHIN LIMIT' END
    ELSE 
      CASE WHEN message_count >= 20 THEN 'LIMIT REACHED' ELSE 'WITHIN LIMIT' END
  END as limit_status
FROM daily_message_usage 
WHERE user_id = 'test-user-fix-verification';
