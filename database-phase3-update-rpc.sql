-- ================================================================
-- PHASE 3: Update RPC function to include must_change_password flag
-- ================================================================

-- Drop the old function
DROP FUNCTION IF EXISTS public.lookup_email_by_username(TEXT);

-- Create updated function with must_change_password
CREATE OR REPLACE FUNCTION public.lookup_email_by_username(username_input TEXT)
RETURNS TABLE (
  email TEXT,
  account_status TEXT,
  must_change_password BOOLEAN,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.email,
    p.account_status,
    p.must_change_password,
    p.id
  FROM profiles p
  WHERE LOWER(p.username) = LOWER(username_input);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.lookup_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_email_by_username(TEXT) TO authenticated;

-- ================================================================
-- TEST THE FUNCTION
-- ================================================================
SELECT * FROM lookup_email_by_username('dalimpolos');

-- Expected result:
-- email: mr.dennisalimpolos@gmail.com
-- account_status: Active
-- must_change_password: true (or false)
-- user_id: your-user-id
-- ================================================================
