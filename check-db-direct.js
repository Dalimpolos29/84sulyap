const { Client } = require('pg')

// Using direct connection string
const connectionString = 'postgresql://postgres:Dabcas_0502@db.bbrjadnmdyqchrnipypp.supabase.co:5432/postgres'

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkDatabase() {
  try {
    await client.connect()
    console.log('Connected to database\n')

    // Check profiles table for sample@gmail.com
    console.log('=== Checking profiles table for sample@gmail.com ===')
    const profileCheck = await client.query(
      "SELECT id, username, email, first_name, last_name FROM profiles WHERE email = $1",
      ['sample@gmail.com']
    )
    console.log('Found in profiles:', profileCheck.rows.length)
    if (profileCheck.rows.length > 0) {
      console.log('Rows:', JSON.stringify(profileCheck.rows, null, 2))
    }

    // Check all emails in profiles
    console.log('\n=== All emails in profiles table ===')
    const allEmails = await client.query(
      "SELECT id, username, email, first_name, last_name FROM profiles WHERE email IS NOT NULL ORDER BY created_at DESC"
    )
    console.log('Total profiles with emails:', allEmails.rows.length)
    allEmails.rows.forEach(row => {
      console.log(`  - ${row.email} (${row.first_name} ${row.last_name}) [${row.username || 'no username'}]`)
    })

    // Count total profiles
    console.log('\n=== Total profiles ===')
    const total = await client.query("SELECT COUNT(*) FROM profiles")
    console.log('Total profiles:', total.rows[0].count)

    // Check auth.users table
    console.log('\n=== Checking auth.users table for sample@gmail.com ===')
    const authCheck = await client.query(
      "SELECT id, email, created_at, confirmed_at FROM auth.users WHERE email = $1",
      ['sample@gmail.com']
    )
    console.log('Found in auth.users:', authCheck.rows.length)
    if (authCheck.rows.length > 0) {
      console.log('Rows:', JSON.stringify(authCheck.rows, null, 2))
    }

    // Check all recent auth users
    console.log('\n=== Recent auth.users ===')
    const recentAuth = await client.query(
      "SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10"
    )
    console.log('Recent auth users:', recentAuth.rows.length)
    recentAuth.rows.forEach(row => {
      console.log(`  - ${row.email} (created: ${row.created_at})`)
    })

  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await client.end()
  }
}

checkDatabase()
