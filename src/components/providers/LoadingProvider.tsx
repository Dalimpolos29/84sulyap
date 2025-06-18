'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProgressLoader from '@/components/ui/ProgressLoader'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => {},
})

export const useLoading = () => useContext(LoadingContext)

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  // Auto-hide loading after a maximum duration
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
      }, 3000) // Max 3 seconds

      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {isLoading && <ProgressLoader duration={1500} />}
      {children}
    </LoadingContext.Provider>
  )
}