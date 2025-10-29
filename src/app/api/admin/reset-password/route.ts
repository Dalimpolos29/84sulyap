import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Reset password to default using admin API
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: 'upis1984' }
    )

    if (resetError) {
      console.error('Supabase admin reset password error:', resetError)
      return NextResponse.json(
        { error: resetError.message },
        { status: 400 }
      )
    }

    // Update must_change_password flag in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error: any) {
    console.error('API reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
