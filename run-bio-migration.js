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

async function runMigration() {
  console.log('=== Adding bio column to profiles table ===\n');

  try {
    // Add bio column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT'
    });

    if (alterError) {
      // If RPC doesn't exist, we'll need to run it differently
      console.log('Note: Cannot add column via RPC. Running verification instead...\n');
    } else {
      console.log('✓ Bio column added successfully\n');
    }

    // Verify the column exists by selecting from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, bio')
      .limit(1);

    if (error) {
      if (error.message.includes('column "bio" does not exist')) {
        console.log('❌ Bio column does NOT exist yet\n');
        console.log('Please run the following SQL in Supabase SQL Editor:\n');
        console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;\n');
        return false;
      }
      throw error;
    }

    console.log('✓ Bio column verified - migration successful!\n');
    if (data && data.length > 0) {
      console.log('Sample profile:', data[0]);
    }
    return true;

  } catch (error) {
    console.error('Migration error:', error.message);
    return false;
  }
}

runMigration().then(success => {
  if (success) {
    console.log('\n✓ Migration completed successfully!');
  } else {
    console.log('\n⚠ Please run the SQL migration manually in Supabase SQL Editor');
    console.log('File: add-bio-field.sql');
  }
  process.exit(success ? 0 : 1);
});
