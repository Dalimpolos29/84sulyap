import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const type = requestUrl.searchParams.get('type') || 'signup'

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Exchange the auth code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.session) {
        // Get the target URL to redirect to after authentication
        const redirectTo = type === 'recovery' ? '/reset-password' : '/auth-success'

        // Set the auth cookie manually to ensure it's properly saved
        await supabase.auth.setSession(data.session)

        // Redirect to the auth-success page with the necessary params
        return NextResponse.redirect(new URL(`${redirectTo}?next=auth-success`, request.url))
      } else {
        // Handle known errors
        let errorMessage = "This verification link has expired or has already been used."
        if (error?.message) {
          errorMessage = error.message
        }

        // Redirect to login page with error
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
        )
      }
    } catch (error: any) {
      console.error("Authentication error:", error.message);
      // If there's an exception, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Return the user to the login page if something goes wrong
  return NextResponse.redirect(new URL('/login', request.url))
} 