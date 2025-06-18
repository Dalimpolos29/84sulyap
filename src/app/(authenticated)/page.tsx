'use client'

import Link from 'next/link'
import { useProfileContext } from '@/contexts/ProfileContext'

export default function DashboardPage() {
  const { profile, loading: profileLoading, fullName } = useProfileContext()

  // Return a loading state while profile is being fetched
  if (profileLoading) {
    return null // Let the route-level loading.tsx handle the loading state
  }

  return (
    <div className="flex items-start justify-center py-12 px-4 font-serif">
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
                <Link 
                  href="/profile"
                  className="text-sm text-[#7D1A1D] hover:underline">
                  Edit Profile
                </Link>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-bold mb-3 text-[#7D1A1D]">Community</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with UPIS Batch '84 alumni
                </p>
                <Link 
                  href="/members"
                  className="text-sm text-[#7D1A1D] hover:underline">
                  Browse Members
                </Link>
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
    </div>
  )
}

{/* Add text-shadow utility class */}
<style jsx global>{`
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`}</style>
