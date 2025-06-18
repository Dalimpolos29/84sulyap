'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { ProfileProvider } from '@/contexts/ProfileContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { user } = useAuth()

  return (
    <ProfileProvider user={user}>
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
        {/* Persistent Header and Navigation */}
        <div className="sticky top-0 z-50">
          <Header />
        </div>

        {/* Main Content Area - This is what changes between pages */}
        <main className="flex-1">
          {children}
        </main>

        {/* Persistent Footer */}
        <Footer />
      </div>
    </ProfileProvider>
  )
}