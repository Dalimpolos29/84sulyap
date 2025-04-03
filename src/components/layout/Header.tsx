'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useProfileContext } from '@/contexts/ProfileContext'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function Header() {
  const pathname = usePathname()
  const { profile, loading: profileLoading, fullName, initials } = useProfileContext()
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Determine if the user is authenticated based on profile data
  const isAuthenticated = !!profile && !profileLoading

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login') // Redirect to login after sign out
    router.refresh()
  }

  return (
    <header className="bg-[#7D1A1D] text-white py-3 shadow-md sticky top-0 z-50">
      <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8">
        
        {/* Unauthenticated Header Layout (e.g., Login Page) */}
        {!isAuthenticated && (
          <>
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border border-[#C9A335] shadow-md">
                <Image
                  src="/images/logo.svg"
                  alt="UPIS 84 Logo"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <span className="font-serif font-bold text-xl">Sulyap84</span>
            </Link>
            <div className="text-white font-serif font-medium">UPIS Alumni Portal</div>
          </>
        )}

        {/* Authenticated Header Layout (e.g., Dashboard) */}
        {isAuthenticated && (
          <>
            <div className="flex-1">
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
                <span className="font-serif font-bold text-base md:text-lg line-clamp-1">UPIS Alumni Portal</span>
              </Link>
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                className="focus:outline-none relative" 
                aria-label="User menu"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {profile?.profile_picture_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C9A335] hover:shadow-md transition-shadow">
                    <Image
                      src={profile.profile_picture_url}
                      alt={`${fullName}'s profile`}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#7D1A1D] font-serif text-lg font-bold border border-[#C9A335] hover:shadow-md transition-shadow">
                    {initials}
                  </div>
                )}
                {/* Dropdown chevron */}
                <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[#7D1A1D] w-4 h-4 flex items-center justify-center border border-white">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              <div className={`absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-10 transition-all duration-200 transform origin-top-right ${dropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                <div className="p-2">
                  <div className="px-4 py-2 text-[#7D1A1D] font-medium border-b border-gray-200">
                    {profile?.first_name || fullName}
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        router.push('/profile')
                        setDropdownOpen(false)
                      }} 
                      className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left">
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
                      onClick={() => {
                        handleSignOut()
                        setDropdownOpen(false)
                      }}
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
          </>
        )}
      </div>
    </header>
  )
} 