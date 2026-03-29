-- ================================================================
-- FIX: Update create_user_profile to use UPSERT
-- ================================================================
-- This handles cases where a trigger already created the profile
-- If profile exists: UPDATE it with username and all fields
-- If profile doesn't exist: INSERT new profile
-- ================================================================

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
SECURITY DEFINER
AS $$
DECLARE
  result_id UUID;
BEGIN
  -- Use INSERT ... ON CONFLICT to handle both insert and update
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
    must_change_password,
    created_at,
    updated_at
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
    p_must_change_password,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    middle_name = EXCLUDED.middle_name,
    last_name = EXCLUDED.last_name,
    suffix = EXCLUDED.suffix,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    account_status = EXCLUDED.account_status,
    must_change_password = EXCLUDED.must_change_password,
    updated_at = NOW()
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;

-- ================================================================
-- EXPLANATION:
-- ================================================================
-- ON CONFLICT (id) means: if a profile with this user ID already exists
-- DO UPDATE SET: update all fields instead of failing
-- RETURNING id: return the ID whether it was inserted or updated
--
-- This fixes the issue where:
-- 1. Trigger creates profile with NULL username
-- 2. This function updates it with the correct username and data
--
-- Or if no trigger exists:
-- 1. This function inserts the new profile normally
-- ================================================================

-- ================================================================
-- TEST: Try creating a user with existing profile
-- ================================================================
-- Should work even if profile exists from trigger
