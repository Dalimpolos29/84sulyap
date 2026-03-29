const { createClient } = require('@supabase/supabase-js');

// Admin client bypasses RLS
const supabase = createClient(
  'https://bbrjadnmdyqchrnipypp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicmphZG5tZHlxY2hybmlweXBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjExMTg3MSwiZXhwIjoyMDU3Njg3ODcxfQ.6gPuwwFANCwnAEVKg-s93UNXONmSDIwyd5JGbA9l_LY',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function addBioColumn() {
  console.log('=== Adding bio column to profiles table ===\n');

  try {
    // Since we can't run ALTER TABLE directly via Supabase JS client,
    // we'll use a workaround by trying to select bio and see if it exists
    console.log('Checking if bio column already exists...');

    const { data, error } = await supabase
      .from('profiles')
      .select('bio')
      .limit(1);

    if (error) {
      if (error.message && error.message.includes('column "bio" does not exist')) {
        console.log('❌ Bio column does NOT exist');
        console.log('\n⚠️  Cannot add columns via Supabase JS Client');
        console.log('\nPlease run this SQL in Supabase SQL Editor:');
        console.log('-------------------------------------------');
        console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;');
        console.log('-------------------------------------------\n');
        console.log('Steps:');
        console.log('1. Go to: https://supabase.com/dashboard/project/bbrjadnmdyqchrnipypp/sql/new');
        console.log('2. Paste the SQL above');
        console.log('3. Click Run\n');
        return false;
      }
      throw error;
    }

    console.log('✅ Bio column already exists!');
    console.log('Sample check passed, column is ready to use.\n');
    return true;

  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

addBioColumn().then(success => {
  if (success) {
    console.log('✓ Migration check completed - bio column exists');
  } else {
    console.log('⚠ Please add the bio column manually');
  }
  process.exit(success ? 0 : 1);
});
