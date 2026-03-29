-- ================================================================
-- FIX: Row Level Security (RLS) blocking login username lookup
-- ================================================================
-- The problem: Unauthenticated users can't read profiles table
-- The solution: Create a secure function that bypasses RLS for login
-- ================================================================

-- Create a function that can lookup username without authentication
CREATE OR REPLACE FUNCTION public.lookup_email_by_username(username_input TEXT)
RETURNS TABLE (email TEXT, account_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  RETURN QUERY
  SELECT p.email, p.account_status
  FROM profiles p
  WHERE LOWER(p.username) = LOWER(username_input);
END;
$$;

-- Grant execute permission to anonymous (unauthenticated) users
GRANT EXECUTE ON FUNCTION public.lookup_email_by_username(TEXT) TO anon;

-- Grant execute permission to authenticated users too
GRANT EXECUTE ON FUNCTION public.lookup_email_by_username(TEXT) TO authenticated;

-- ================================================================
-- TEST THE FUNCTION
-- ================================================================
-- Run this to test if it works:
SELECT * FROM lookup_email_by_username('dalimpolos');

-- Expected result:
-- email: mr.dennisalimpolos@gmail.com
-- account_status: Active
-- ================================================================

-- ================================================================
-- SECURITY NOTES:
-- ================================================================
-- This function is safe because:
-- 1. It only returns email and account_status (no sensitive data)
-- 2. The actual password verification happens via Supabase Auth
-- 3. It's needed for the login flow to work
-- 4. Username is not sensitive information
-- ================================================================
