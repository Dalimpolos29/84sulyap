import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          response.cookies.delete(name)
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Only protect non-auth routes that require authentication
  // Root URL (/) will be handled by the page component itself
  if (!session && 
      !request.nextUrl.pathname.startsWith('/(auth)') && 
      !request.nextUrl.pathname.startsWith('/callback') &&
      !request.nextUrl.pathname.startsWith('/auth-success') && 
      request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// Ensure middleware runs only on the pages we want it to
export const config = {
  matcher: [
    // Protect all routes except auth routes and static files
    '/((?!auth|_next/static|_next/image|icons|images|callback|auth-success).*)',
  ]
} 