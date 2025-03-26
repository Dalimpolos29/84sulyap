'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginPage from './(auth)/login/page'

export default function RootPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [signoutSuccess, setSignoutSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setIsLoading(false)
    }
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  // Keep this for compatibility, but we'll use a more robust approach
  useEffect(() => {
    if (signoutSuccess) {
      const timer = setTimeout(() => {
        router.replace('/login')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [signoutSuccess, router])

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

  // Enhanced sign out with retry logic
  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Verify the sign-out was successful
      let attempts = 0
      const maxAttempts = 3
      
      const checkAndNavigate = async () => {
        attempts++
        try {
          // Check if session is null (sign out successful)
          const { data } = await supabase.auth.getSession()
          
          if (!data.session) {
            // Session is confirmed to be gone, navigate
            window.location.href = '/login'
          } else if (attempts < maxAttempts) {
            // Try again after a delay
            setTimeout(checkAndNavigate, 500)
          } else {
            // Last resort fallback
            window.location.href = '/login'
          }
        } catch (err) {
          console.error("Session check error:", err)
          // Fallback if there's an error checking session
          if (attempts < maxAttempts) {
            setTimeout(checkAndNavigate, 500)
          } else {
            window.location.href = '/login'
          }
        }
      }
      
      // Start the check process
      checkAndNavigate()
    } catch (error) {
      console.error("Sign out error:", error)
      // Fallback if sign out fails
      window.location.href = '/login'
    }
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
