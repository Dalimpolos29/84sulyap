-- ================================================================
-- DEBUG: Login Issue Troubleshooting
-- ================================================================
-- Run these queries in Supabase SQL Editor to diagnose the problem
-- ================================================================

-- 1. Check if your profile exists and has the correct data
SELECT
  id,
  username,
  email,
  first_name,
  last_name,
  account_status,
  role,
  password_hash,
  must_change_password
FROM profiles
WHERE email = 'mr.dennisalimpolos@gmail.com';

-- Expected results:
-- username: 'dalimpolos'
-- email: 'mr.dennisalimpolos@gmail.com'
-- account_status: 'Active'
-- password_hash: NULL (for now, we use Supabase auth)

-- ================================================================

-- 2. Check if username exists (case-insensitive search)
SELECT
  username,
  email,
  account_status
FROM profiles
WHERE LOWER(username) = LOWER('dalimpolos');

-- Should return your profile

-- ================================================================

-- 3. List all usernames in the system
SELECT
  username,
  email,
  first_name,
  last_name,
  account_status
FROM profiles
WHERE username IS NOT NULL
ORDER BY username;

-- ================================================================

-- 4. If username is NULL, set it now:
UPDATE profiles
SET username = 'dalimpolos'
WHERE email = 'mr.dennisalimpolos@gmail.com';

-- Then verify:
SELECT username, email FROM profiles WHERE email = 'mr.dennisalimpolos@gmail.com';

-- ================================================================

-- 5. Make sure account is active:
UPDATE profiles
SET account_status = 'Active'
WHERE email = 'mr.dennisalimpolos@gmail.com';

-- ================================================================

-- 6. Check all profiles without usernames (need to be fixed)
SELECT
  id,
  email,
  first_name,
  last_name,
  username
FROM profiles
WHERE username IS NULL OR username = '';

-- ================================================================
-- IMPORTANT NOTES:
-- ================================================================
-- 1. The password is still stored in Supabase's auth.users table
-- 2. We look up username → get email → use email+password for auth
-- 3. Your Supabase auth password should still work (123456789)
-- 4. After running the UPDATE, try logging in with:
--    Username: dalimpolos
--    Password: 123456789
-- ================================================================
