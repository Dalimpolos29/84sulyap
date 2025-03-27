'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { useProfile, Profile, formatFullName, getInitials } from '@/hooks/useProfile'

// Context type definition
type ProfileContextType = {
  profile: Profile | null
  loading: boolean
  error: string | null
  fullName: string
  initials: string
  refetchProfile: () => Promise<void>
}

// Create context with default values
const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  fullName: 'Unknown User',
  initials: 'U',
  refetchProfile: async () => {}
})

// Provider props definition
type ProfileProviderProps = {
  user: User | null
  children: ReactNode
}

// Provider component
export function ProfileProvider({ user, children }: ProfileProviderProps) {
  const { profile, loading, error, refetch } = useProfile(user)
  
  // Derived values
  const fullName = formatFullName(profile)
  const initials = getInitials(profile)
  
  const contextValue = {
    profile,
    loading,
    error,
    fullName,
    initials,
    refetchProfile: refetch
  }
  
  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  )
}

// Custom hook to use the profile context
export function useProfileContext() {
  const context = useContext(ProfileContext)
  
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider')
  }
  
  return context
} 