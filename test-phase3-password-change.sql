-- ================================================================
-- TEST PHASE 3: Force Password Change on First Login
-- ================================================================

-- STEP 1: Update the RPC function (run database-phase3-update-rpc.sql first!)

-- STEP 2: Set must_change_password = true to test the flow
UPDATE profiles
SET must_change_password = true
WHERE email = 'mr.dennisalimpolos@gmail.com';

-- Verify the update
SELECT
  username,
  email,
  must_change_password,
  account_status
FROM profiles
WHERE email = 'mr.dennisalimpolos@gmail.com';

-- Expected result:
-- username: dalimpolos
-- email: mr.dennisalimpolos@gmail.com
-- must_change_password: true
-- account_status: Active

-- ================================================================
-- TESTING FLOW:
-- ================================================================
-- 1. Run database-phase3-update-rpc.sql to update the RPC function
-- 2. Run this SQL to set must_change_password = true
-- 3. Log out from the website if logged in
-- 4. Login with: username: dalimpolos, password: 123456789
-- 5. After successful login, you should see the password change dialog
-- 6. Set a new password (minimum 6 characters)
-- 7. Click "Set New Password"
-- 8. You should be redirected to the dashboard
-- 9. must_change_password should be set to false automatically
-- ================================================================

-- TO VERIFY AFTER TESTING:
-- Check if the flag was set to false
SELECT
  username,
  must_change_password
FROM profiles
WHERE email = 'mr.dennisalimpolos@gmail.com';

-- Should show: must_change_password: false

-- ================================================================
-- TO RESET FOR TESTING AGAIN:
-- ================================================================
-- Run Step 2 again to set must_change_password = true
-- Then you can test the flow again
-- ================================================================
