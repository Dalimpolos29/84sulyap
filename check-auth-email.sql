-- ================================================================
-- Check for sample@gmail.com in auth.users table
-- ================================================================

-- Check auth.users for the email
SELECT id, email, created_at, confirmed_at
FROM auth.users
WHERE email = 'sample@gmail.com';

-- Check all auth users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- ================================================================
-- If email exists in auth.users but not in profiles,
-- delete it from auth.users:
-- ================================================================
-- DELETE FROM auth.users WHERE email = 'sample@gmail.com';
