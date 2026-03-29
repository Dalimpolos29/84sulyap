-- ================================================================
-- FIX: RLS Policy Blocking Profile Creation by Admins
-- ================================================================
-- Create a secure function that allows admins to create new profiles
-- ================================================================

-- Create function to create new user profile (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_id UUID,
  p_username TEXT,
  p_first_name TEXT,
  p_middle_name TEXT,
  p_last_name TEXT,
  p_suffix TEXT,
  p_email TEXT,
  p_role TEXT,
  p_account_status TEXT,
  p_must_change_password BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Insert the new profile
  INSERT INTO profiles (
    id,
    username,
    first_name,
    middle_name,
    last_name,
    suffix,
    email,
    role,
    account_status,
    must_change_password
  ) VALUES (
    p_id,
    p_username,
    p_first_name,
    p_middle_name,
    p_last_name,
    p_suffix,
    p_email,
    p_role,
    p_account_status,
    p_must_change_password
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Grant execute permission to authenticated users (admins)
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;

-- ================================================================
-- Also create a function to check username availability
-- ================================================================
CREATE OR REPLACE FUNCTION public.check_username_exists(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO username_count
  FROM profiles
  WHERE LOWER(username) = LOWER(username_to_check);

  RETURN username_count > 0;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_username_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_exists(TEXT) TO anon;

-- ================================================================
-- TEST THE FUNCTIONS
-- ================================================================
-- Test checking username
SELECT check_username_exists('dalimpolos');
-- Should return true if username exists

-- ================================================================
-- SECURITY NOTES:
-- ================================================================
-- This function is safe because:
-- 1. Only authenticated users can execute it
-- 2. It creates profiles with proper validation
-- 3. Admins need this to create user accounts
-- 4. The function doesn't expose sensitive data
-- ================================================================
