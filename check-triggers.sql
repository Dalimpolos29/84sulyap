-- Check for triggers on auth.users that create profiles
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';

-- Check for functions that handle new user creation
SELECT
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname LIKE '%handle%user%' OR proname LIKE '%new%user%';
