'use client'

// Enhanced dashboard with robust session handling and sign-out flow
// This implementation ensures proper session verification before navigation

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginPage from './(auth)/login/page'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ProfileProvider, useProfileContext } from '@/contexts/ProfileContext'

// Dashboard content component that uses profile context
function DashboardContent({ session, handleSignOut }: { session: any, handleSignOut: () => Promise<void> }) {
  const { profile, loading: profileLoading, fullName, initials } = useProfileContext()
  
  // Return a loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#E5DFD0",
        backgroundImage:
          "radial-gradient(#7D1A1D 0.5px, transparent 0.5px), radial-gradient(#C9A335 0.5px, #E5DFD0 0.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Updated Header to match Facebook style */}
      <header className="bg-[#7D1A1D] text-white py-2 shadow-md sticky top-0 z-50">
        <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-[#C9A335] shadow-md">
                <Image
                  src="/images/logo.svg"
                  alt="UPIS 84 Logo"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <span className="font-serif font-bold text-lg hidden sm:inline">UPIS Alumni Portal</span>
            </Link>
            
            {/* Search Bar */}
            <div className="relative ml-4 hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#7D1A1D]/20 text-white placeholder-white/60 rounded-full px-4 py-1.5 w-56 lg:w-72 border border-white/20 focus:outline-none focus:border-[#C9A335] text-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 focus:outline-none">
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#7D1A1D] font-serif text-lg font-bold border border-[#C9A335]">
                {initials}
              </div>
              <span className="text-white font-serif hidden md:inline">{fullName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
              <div className="p-2">
                <div className="px-4 py-2 text-[#7D1A1D] font-medium border-b border-gray-200">
                  {fullName}
                </div>
                <div className="px-4 py-1 text-gray-500 text-sm">
                  {profile?.profession || 'Class President'}
                </div>
                <div className="pt-2">
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    My Profile
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Account Settings
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left mt-1 border-t border-gray-100 pt-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center py-12 px-4 font-serif">
        <div className="max-w-4xl w-full">
          <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#7D1A1D] text-white py-3 md:py-4 px-6 text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 text-shadow">
                Welcome to Your Dashboard
              </h1>
              <p className="font-serif text-xs md:text-sm truncate text-shadow text-center mx-auto w-full">
                Reconnecting Our Past, Empowering Our Future
              </p>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Welcome, <span className="font-medium">{fullName}</span>
                {profile?.company && <span> from {profile.company}</span>}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-bold mb-3 text-[#7D1A1D]">Profile Information</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Update your personal information and preferences
                  </p>
                  <button className="text-sm text-[#7D1A1D] hover:underline">
                    Edit Profile
                  </button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-bold mb-3 text-[#7D1A1D]">Community</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect with UPIS Batch '84 alumni
                  </p>
                  <button className="text-sm text-[#7D1A1D] hover:underline">
                    Browse Members
                  </button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-bold mb-3 text-[#7D1A1D]">Events</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Upcoming batch gatherings and activities
                  </p>
                  <button className="text-sm text-[#7D1A1D] hover:underline">
                    View Calendar
                  </button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-bold mb-3 text-[#7D1A1D]">Photo Gallery</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Explore memories through our photo collections
                  </p>
                  <button className="text-sm text-[#7D1A1D] hover:underline">
                    Browse Photos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#7D1A1D]/20 mt-auto">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-[#7D1A1D]/70 font-serif">© 2025 UPIS Batch '84 Alumni Portal</p>
              <p className="text-sm text-[#7D1A1D]/70 font-serif">All Rights Reserved</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-sm text-[#7D1A1D] hover:underline font-serif">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="text-sm text-[#7D1A1D] hover:underline font-serif">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

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

  // Wrap dashboard content with ProfileProvider for access to user profile data
  return (
    <ProfileProvider user={session.user}>
      <DashboardContent session={session} handleSignOut={handleSignOut} />
    </ProfileProvider>
  )
}

{/* Add text-shadow utility class */}
<style jsx global>{`
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`}</style>
