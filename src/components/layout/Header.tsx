'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useProfileContext } from '@/contexts/ProfileContext'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Home,
  Users,
  Image as ImageIcon,
  Phone,
  Search,
  Calendar,
  Heart,
  Shield,
  Menu,
  X
} from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const { profile, loading: profileLoading, fullName, initials } = useProfileContext()
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Determine if the user is authenticated based on profile data
  const isAuthenticated = !!profile && !profileLoading

  // Check if user is admin
  const isAdmin = profile?.role === 'Officer' || profile?.role === 'Super Admin'

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem('welcomeHeroShown') // Clear hero flag on logout
    router.push('/login')
    router.refresh()
  }

  const baseNavItems = [
    { name: 'Home', href: '/', icon: Home, current: pathname === '/' },
    { name: 'Members', href: '/members', icon: Users, current: pathname === '/members' },
    { name: 'Events', href: '/events', icon: Calendar, current: pathname === '/events' },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon, current: pathname.startsWith('/gallery') },
    { name: 'Contact', href: '/contact', icon: Phone, current: pathname.startsWith('/contact') },
    { name: 'Support', href: '/support', icon: Heart, current: pathname === '/support' }
  ]

  const navItems = isAdmin
    ? [...baseNavItems, { name: 'Admin', href: '/admin', icon: Shield, current: pathname === '/admin' }]
    : baseNavItems

  return (
    <header className="sticky top-0 z-50 bg-[#7D1A1D] text-white shadow-md">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">

        {/* Unauthenticated Header */}
        {!isAuthenticated && (
          <div className="flex justify-between items-center py-3">
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
          </div>
        )}

        {/* Authenticated Header with Navigation */}
        {isAuthenticated && (
          <>
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between py-2">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C9A335]">
                  <Image
                    src="/images/logo.svg"
                    alt="UPIS 84 Logo"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    priority
                  />
                </div>
                <span className="font-serif font-bold text-base whitespace-nowrap">UPIS '84</span>
              </Link>

              {/* Nav Links */}
              <nav className="flex items-center gap-1 flex-1 justify-center">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-white/20 text-white'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Search + User Profile */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 bg-white/20 text-white placeholder-white/60 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:bg-white/30 transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="focus:outline-none relative"
                  >
                    {profile?.profile_picture_url ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#C9A335] hover:border-white transition-colors">
                        <Image
                          src={profile.profile_picture_url}
                          alt={fullName}
                          width={36}
                          height={36}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center text-[#7D1A1D] font-serif text-sm font-bold border-2 border-[#C9A335] hover:border-white transition-colors">
                        {initials}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden transition-all duration-200 origin-top-right ${dropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                    <div className="p-2">
                      <div className="px-4 py-2 text-[#7D1A1D] font-medium border-b border-gray-200">
                        {fullName}
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            router.push('/profile')
                            setDropdownOpen(false)
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left"
                        >
                          <Users className="w-5 h-5" />
                          My Profile
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            </div>

            {/* Mobile Header - Simple */}
            <div className="md:hidden flex items-center justify-between py-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C9A335]">
                  <Image src="/images/logo.svg" alt="UPIS 84" width={36} height={36} className="rounded-full" priority />
                </div>
                <span className="font-serif font-bold text-base">UPIS '84</span>
              </Link>

              {/* User Avatar Only */}
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative">
                {profile?.profile_picture_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C9A335]">
                    <Image src={profile.profile_picture_url} alt={fullName} width={32} height={32} className="object-cover" />
                  </div>
                ) : (
                  <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-[#7D1A1D] font-serif text-xs font-bold border border-[#C9A335]">
                    {initials}
                  </div>
                )}
              </button>

              {/* User Dropdown - Mobile */}
              <div ref={dropdownRef} className={`absolute right-4 top-14 w-56 bg-white rounded-md shadow-lg overflow-hidden transition-all duration-200 z-50 ${dropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                <div className="p-2">
                  <div className="px-4 py-2 text-[#7D1A1D] font-medium border-b border-gray-200">{fullName}</div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        router.push('/profile')
                        setDropdownOpen(false)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left"
                    >
                      <Users className="w-5 h-5" />
                      My Profile
                    </button>
                    <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

            {/* Mobile Menu Button - Floating */}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#7D1A1D] rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:bg-[#5d1316] transition-all"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Sidebar - Slides from LEFT */}
                <div
                  className={`md:hidden fixed top-0 left-0 h-full w-72 bg-[#7D1A1D] shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    {/* Logo at Top */}
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-white/20">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#C9A335]">
                        <Image
                          src="/images/logo.svg"
                          alt="UPIS 84 Logo"
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          priority
                        />
                      </div>
                      <span className="font-serif font-bold text-lg text-white">UPIS '84</span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 space-y-2 px-4 pt-6">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                            item.current
                              ? 'bg-white/20 text-white shadow-md'
                              : 'text-white/90 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      ))}
                    </nav>

                    {/* User Info at Bottom */}
                    <div className="border-t border-white/20 pt-4 pb-6 px-4">
                      <div className="flex items-center gap-3 px-4 py-2 text-white">
                        {profile?.profile_picture_url ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C9A335]">
                            <Image src={profile.profile_picture_url} alt={fullName} width={40} height={40} className="object-cover" />
                          </div>
                        ) : (
                          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#7D1A1D] font-serif text-sm font-bold border-2 border-[#C9A335]">
                            {initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{fullName}</p>
                          <p className="text-xs text-white/70 truncate">{profile?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay */}
                {mobileMenuOpen && (
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </header>
  )
} 