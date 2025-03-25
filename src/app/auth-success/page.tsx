'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Create a client component that uses the search params
function EmailVerificationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [timeLeft, setTimeLeft] = useState(5)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if this is indeed a verification success
    const isVerified = searchParams.has('access_token') || searchParams.get('next') === 'auth-success'
    
    if (!isVerified) {
      // If not a verification, redirect to home
      router.replace('/')
      return
    }

    // Handle countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Check the auth status to ensure we're logged in
    const checkAuth = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setError('There was an issue with your authentication. Please try logging in.')
        return
      }

      if (!data.session) {
        // If no session, try to set it from URL params if available
        if (searchParams.has('access_token')) {
          try {
            const accessToken = searchParams.get('access_token')
            const refreshToken = searchParams.get('refresh_token')
            
            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              })
            }
          } catch (e) {
            console.error('Error setting session:', e)
          }
        }
      }
    }

    checkAuth()

    return () => clearInterval(timer)
  }, [router, searchParams])

  // Separate effect for navigation to avoid React state updates during rendering
  useEffect(() => {
    if (timeLeft === 0) {
      // Navigate when timer reaches 0
      router.replace('/')
    }
  }, [timeLeft, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 flex items-center justify-center border-2 border-[#C9A335] bg-white">
          <Image
            src="/images/logo.svg"
            alt="UPIS 84 Logo"
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
        </div>
        
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been verified. You can now access all features of the application.
            </p>
          </>
        )}
        
        <p className="text-[#7D1A1D] font-medium">
          Redirecting to home in <span className="font-bold">{timeLeft}</span> seconds...
        </p>
      </div>
    </div>
  )
}

// Use suspense boundary for the main page component
export default function AuthSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <EmailVerificationContent />
    </Suspense>
  )
} 