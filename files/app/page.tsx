'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginPage from '@/app/(auth)/login/page'

export default function RootPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setIsLoading(false)
    }
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (!session) {
        // Clear router cache and redirect
        router.refresh() // Clear Next.js cache
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Handle sign out with proper cache clearing
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Clear session state
      setSession(null)
      // Clear router cache and force navigation
      router.refresh()
      router.replace('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Fallback redirect with cache clearing
      router.refresh()
      router.replace('/login')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If not authenticated, show login page
  if (!session) {
    return <LoginPage />
  }

  // If authenticated, show dashboard content
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="text-xl font-semibold">Sulyap84 Dashboard</div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{session.user?.email}</span>
              <button
                onClick={handleSignOut}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-gray-600">
            You are successfully logged in with: {session.user?.email}
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              This is a basic dashboard. You can customize it further based on your needs.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
