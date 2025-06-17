import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProfileContext } from '@/contexts/ProfileContext'
import { 
  Home,
  Users,
  Image as ImageIcon,
  Phone,
  Search,
  ChevronDown,
  Menu,
  X,
  Calendar,
  Heart
} from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const { profile, loading: profileLoading } = useProfileContext()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Determine if the user is authenticated based on profile data
  const isAuthenticated = !!profile && !profileLoading

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: pathname === '/'
    },
    {
      name: 'Members Directory',
      href: '/members',
      icon: Users,
      current: pathname === '/members'
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      current: pathname === '/events',
      dropdown: [
        { name: 'Upcoming', href: '/events/upcoming' },
        { name: 'Past Events', href: '/events/past' },
        { name: 'Calendar', href: '/events/calendar' }
      ]
    },
    {
      name: 'Gallery',
      href: '/gallery',
      icon: ImageIcon,
      current: pathname.startsWith('/gallery'),
      dropdown: [
        { name: 'Photos', href: '/gallery/photos' },
        { name: 'Digital Sulyap', href: '/gallery/sulyap' }
      ]
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: Phone,
      current: pathname.startsWith('/contact'),
      dropdown: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Support', href: '/contact/support' }
      ]
    },
    {
      name: 'Support',
      href: '/support',
      icon: Heart,
      current: pathname === '/support'
    }
  ]

  if (!isAuthenticated) return null

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 font-serif">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between px-4 sm:px-6 md:px-8 h-12">
          {/* Search Bar - Now on the left */}
          <div className="relative flex items-center w-64">
            <div className={`flex items-center transition-all duration-300 w-full`}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setIsSearchOpen(false)}
                className="w-full bg-gray-100 text-gray-900 text-sm rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7D1A1D]/20 transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Navigation Items - Now centered */}
          <div className="flex-1 flex items-center justify-center space-x-1">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    item.current
                      ? 'text-[#7D1A1D] bg-[#7D1A1D]/5'
                      : 'text-gray-700 hover:text-[#7D1A1D] hover:bg-[#7D1A1D]/5'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  {item.name}
                  {item.dropdown && (
                    <ChevronDown className="w-4 h-4 ml-1 flex-shrink-0" />
                  )}
                </Link>
                
                {/* Dropdown Menu */}
                {item.dropdown && (
                  <div className="absolute left-0 mt-1 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#7D1A1D]/5 hover:text-[#7D1A1D]"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty div for flex spacing */}
          <div className="w-64"></div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 h-12">
            {/* Mobile Search - Now on the left */}
            <div className="relative flex-1 max-w-[200px]">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 text-sm rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7D1A1D]/20"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            {/* Menu button - Now on the right */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-[#7D1A1D] focus:outline-none ml-4"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`${
              isMobileMenuOpen ? 'max-h-[calc(100vh-120px)]' : 'max-h-0'
            } absolute right-0 w-auto min-w-[200px] max-w-[280px] overflow-y-auto transition-all duration-300 ease-in-out bg-white border-t border-gray-200 border-x`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-md whitespace-nowrap ${
                      item.current
                        ? 'text-[#7D1A1D] bg-[#7D1A1D]/5'
                        : 'text-gray-700 hover:text-[#7D1A1D] hover:bg-[#7D1A1D]/5'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="ml-8 space-y-0.5">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:text-[#7D1A1D] hover:bg-[#7D1A1D]/5 whitespace-nowrap"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 