-- ================================================================
-- 84SULYAP - PHASE 1: DATABASE SCHEMA UPDATES
-- Authentication System Migration
-- ================================================================
-- Run this script in Supabase SQL Editor
-- ================================================================

-- 1. Add username column (unique, lowercase)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Add password_hash column (will store hashed passwords)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. Add must_change_password flag (true for first login)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;

-- 4. Add role column with enum constraint
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Alumni' CHECK (role IN ('Alumni', 'Officer', 'Super Admin'));

-- 5. Add account_status column with enum constraint
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'Active' CHECK (account_status IN ('Active', 'Inactive', 'Deceased'));

-- 6. Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 7. Create index on role for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 8. Create index on account_status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- ================================================================
-- VERIFICATION QUERIES (Run these after the ALTER statements)
-- ================================================================

-- Check if columns were added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('username', 'password_hash', 'must_change_password', 'role', 'account_status')
ORDER BY column_name;

-- Check current profiles structure
SELECT COUNT(*) as total_profiles FROM profiles;

-- ================================================================
-- NOTES:
-- ================================================================
-- 1. All existing profiles will have:
--    - username: NULL (will be set when admin creates accounts)
--    - password_hash: NULL (will be set when password is created)
--    - must_change_password: true (require password change on first login)
--    - role: 'Alumni' (default role)
--    - account_status: 'Active' (default status)
--
-- 2. Username must be unique - no two users can have same username
--
-- 3. Existing auth.users table remains unchanged for now
--    We'll migrate away from it in Phase 2
--
-- 4. No data will be lost - this only adds new columns
-- ================================================================
