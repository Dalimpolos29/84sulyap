const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://bbrjadnmdyqchrnipypp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicmphZG5tZHlxY2hybmlweXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMTE4NzEsImV4cCI6MjA1NzY4Nzg3MX0.exP0GLy6H4pI6LXDd5ctxjjtjmVpVPP7Lgm40UPiFYE'
)

async function checkEmail() {
  console.log('\n=== Checking for sample@gmail.com in profiles table ===\n')

  // Check profiles table
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'sample@gmail.com')

  if (profileError) {
    console.error('Error checking profiles:', profileError)
  } else {
    console.log('Profiles with sample@gmail.com:', profiles)
    console.log('Count:', profiles?.length || 0)
  }

  console.log('\n=== Checking all emails in profiles table ===\n')

  // Get all emails
  const { data: allProfiles, error: allError } = await supabase
    .from('profiles')
    .select('id, username, email, first_name, last_name')
    .order('created_at', { ascending: false })

  if (allError) {
    console.error('Error getting all profiles:', allError)
  } else {
    console.log('Total profiles:', allProfiles?.length)
    console.log('\nAll profiles with emails:')
    allProfiles?.forEach(p => {
      if (p.email) {
        console.log(`  - ${p.email} (${p.first_name} ${p.last_name}) [${p.username || 'no username'}]`)
      }
    })

    console.log('\nProfiles without emails:', allProfiles?.filter(p => !p.email).length)
  }
}

checkEmail()
