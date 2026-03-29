-- ================================================================
-- SETUP: Grant Admin Access to Test Account
-- ================================================================
-- This script gives your test account Super Admin access
-- ================================================================

-- Option 1: Make yourself a Super Admin (full access)
UPDATE profiles
SET role = 'Super Admin'
WHERE email = 'mr.dennisalimpolos@gmail.com';

-- Option 2: Make yourself an Officer (regular admin)
-- UPDATE profiles
-- SET role = 'Officer'
-- WHERE email = 'mr.dennisalimpolos@gmail.com';

-- Verify the update
SELECT
  username,
  email,
  first_name,
  last_name,
  role,
  account_status
FROM profiles
WHERE email = 'mr.dennisalimpolos@gmail.com';

-- Expected result:
-- username: dalimpolos
-- email: mr.dennisalimpolos@gmail.com
-- role: Super Admin (or Officer)
-- account_status: Active

-- ================================================================
-- TESTING ADMIN PANEL:
-- ================================================================
-- 1. Run this SQL to grant admin access
-- 2. Log out and log back in (to refresh profile data)
-- 3. Navigate to: /admin
-- 4. You should see the admin panel with user management
-- ================================================================

-- ================================================================
-- ROLE PERMISSIONS:
-- ================================================================
-- Alumni: Can view all pages, edit own profile only
-- Officer: Everything Alumni can do + access admin panel + manage users
-- Super Admin: Everything Officer can do + delete accounts + promote/demote admins
-- ================================================================
