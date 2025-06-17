'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { useProfile, Profile, formatFullName, formatDisplayName, formatNameWithMiddleInitial, getInitials } from '@/hooks/useProfile'

// Context type definition
type ProfileContextType = {
  profile: Profile | null
  loading: boolean
  error: string | null
  fullName: string
  displayName: string
  nameWithMiddleInitial: string
  initials: string
  refetchProfile: () => Promise<void>
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>
}

// Create context with default values
const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  fullName: 'Unknown User',
  displayName: 'Unknown User',
  nameWithMiddleInitial: 'Unknown User',
  initials: 'U',
  refetchProfile: async () => {},
  setProfile: () => {}
})

// Provider props definition
type ProfileProviderProps = {
  user: User | null
  children: ReactNode
}

// Provider component
export function ProfileProvider({ user, children }: ProfileProviderProps) {
  const { profile, loading, error, refetch, setProfile } = useProfile(user)
  
  // Derived values
  const fullName = formatFullName(profile)
  const displayName = formatDisplayName(profile)
  const nameWithMiddleInitial = formatNameWithMiddleInitial(profile)
  const initials = getInitials(profile)
  
  const contextValue = {
    profile,
    loading,
    error,
    fullName,
    displayName,
    nameWithMiddleInitial,
    initials,
    refetchProfile: refetch,
    setProfile
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