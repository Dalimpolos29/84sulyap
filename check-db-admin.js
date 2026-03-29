const { createClient } = require('@supabase/supabase-js')

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
)

async function checkDatabase() {
  console.log('=== Using SERVICE_ROLE key (bypasses RLS) ===\n')

  // Check for sample@gmail.com
  console.log('Checking for sample@gmail.com in profiles...')
  const { data: sampleCheck, error: sampleError } = await supabase
    .from('profiles')
    .select('id, username, email, first_name, last_name')
    .eq('email', 'sample@gmail.com')

  if (sampleError) {
    console.error('Error:', sampleError)
  } else {
    console.log('Found:', sampleCheck.length, 'rows')
    if (sampleCheck.length > 0) {
      console.log('Data:', JSON.stringify(sampleCheck, null, 2))
    }
  }

  // Get total count
  console.log('\n=== Total profiles in table ===')
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error:', countError)
  } else {
    console.log('Total profiles:', count)
  }

  // Get all emails
  console.log('\n=== All profiles with emails ===')
  const { data: allEmails, error: allError } = await supabase
    .from('profiles')
    .select('id, username, email, first_name, last_name')
    .not('email', 'is', null)
    .order('created_at', { ascending: false })

  if (allError) {
    console.error('Error:', allError)
  } else {
    console.log('Profiles with emails:', allEmails.length)
    allEmails.forEach(p => {
      console.log(`  - ${p.email} (${p.first_name} ${p.last_name}) [username: ${p.username || 'NULL'}]`)
    })
  }

  // Get all profiles
  console.log('\n=== All profiles (first 20) ===')
  const { data: allProfiles, error: allProfilesError } = await supabase
    .from('profiles')
    .select('id, username, email, first_name, last_name, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (allProfilesError) {
    console.error('Error:', allProfilesError)
  } else {
    console.log('Total shown:', allProfiles.length)
    allProfiles.forEach(p => {
      console.log(`  - ${p.first_name} ${p.last_name} | email: ${p.email || 'NULL'} | username: ${p.username || 'NULL'}`)
    })
  }
}

checkDatabase()
