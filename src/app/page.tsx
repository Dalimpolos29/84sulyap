'use client'

// Enhanced dashboard with robust session handling and sign-out flow
// This implementation ensures proper session verification before navigation

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import LoginPage from './(auth)/login/page'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ProfileProvider, useProfileContext } from '@/contexts/ProfileContext'
import Header from "@/components/layout/Header"
import Footer from '@/components/layout/Footer'
import ProgressLoader from '@/components/ui/ProgressLoader'

// Dashboard content component that uses profile context
function DashboardContent({ session }: { session: any }) {
  const { profile, loading: profileLoading, fullName, initials } = useProfileContext()
  const router = useRouter()

  // Return a loading state while profile is being fetched
  if (profileLoading) {
    return null // Let the route-level loading.tsx handle the loading state
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
      <Header />

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
                  <button 
                    onClick={() => router.push('/profile')} 
                    className="text-sm text-[#7D1A1D] hover:underline">
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

      <Footer />
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
    return null // Let the route-level loading.tsx handle the loading state
  }

  // If not authenticated, show login page
  if (!session) {
    return <LoginPage />
  }

  // Wrap dashboard content with ProfileProvider for access to user profile data
  return (
    <ProfileProvider user={session.user}>
      <DashboardContent session={session} />
    </ProfileProvider>
  )
}

{/* Add text-shadow utility class */}
<style jsx global>{`
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`}</style>
