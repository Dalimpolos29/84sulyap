-- ================================================================
-- 84SULYAP - Add Bio Field to Profiles
-- Adds a bio/description field for user profiles
-- ================================================================
-- Run this script in Supabase SQL Editor
-- ================================================================

-- Add bio column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comment to document the column
COMMENT ON COLUMN profiles.bio IS 'User biography or description - like Facebook bio';

-- ================================================================
-- VERIFICATION QUERY (Run this after the ALTER statement)
-- ================================================================

-- Check if column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'bio';

-- ================================================================
-- NOTES:
-- ================================================================
-- 1. All existing profiles will have bio: NULL by default
-- 2. Users can update their bio through the profile edit page
-- 3. Bio is a text field with no length limit (can be adjusted if needed)
-- ================================================================
