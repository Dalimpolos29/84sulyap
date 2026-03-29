import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check profiles table for sample@gmail.com
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email, first_name, last_name')
      .eq('email', 'sample@gmail.com')

    // Get all emails
    const { data: allEmails, error: allError } = await supabase
      .from('profiles')
      .select('id, username, email, first_name, last_name')
      .not('email', 'is', null)
      .order('created_at', { ascending: false })

    // Get total count
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      profileCheck: {
        found: profileCheck?.length || 0,
        data: profileCheck,
        error: profileError?.message
      },
      allEmails: {
        total: allEmails?.length || 0,
        data: allEmails,
        error: allError?.message
      },
      totalProfiles: count,
      countError: countError?.message
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
