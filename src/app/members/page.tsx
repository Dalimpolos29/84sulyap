'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginPage from '../(auth)/login/page'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ProfileProvider } from '@/contexts/ProfileContext'
import StatsCard from '@/components/features/members/StatsCard'
import MembersSearch from '@/components/features/members/MembersSearch'
import MembersGrid from '@/components/features/members/MembersGrid'

function MembersContent({ session }: { session: any }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleViewChange = (view: 'grid' | 'list') => {
    setViewMode(view)
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
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      
      <main className="flex-1">
        <StatsCard />
        <MembersSearch onSearch={handleSearch} onViewChange={handleViewChange} />
        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
          <MembersGrid searchQuery={searchQuery} viewMode={viewMode} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function MembersDirectory() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setIsLoading(false)
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <ProfileProvider user={session.user}>
      <MembersContent session={session} />
    </ProfileProvider>
  )
} 