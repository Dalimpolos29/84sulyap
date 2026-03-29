-- ================================================================
-- FIX: Make email column nullable in profiles table
-- ================================================================
-- This allows users to be created without an email address
-- The UNIQUE constraint will remain but allows multiple NULLs
-- ================================================================

-- Make email column nullable
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check email column constraints
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'email';

-- Check if UNIQUE constraint still exists (should show profiles_email_key)
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname LIKE '%email%';

-- ================================================================
-- EXPECTED RESULTS:
-- ================================================================
-- Column query should show:
--   - column_name: email
--   - is_nullable: YES
--   - UNIQUE constraint still exists
--
-- This allows:
--   ✓ Multiple users with NULL email (no email provided)
--   ✓ Users with unique email addresses
--   ✗ Duplicate non-NULL emails
-- ================================================================
