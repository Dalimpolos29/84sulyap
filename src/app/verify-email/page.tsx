"use client"

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Header from "@/components/layout/Header"
import Footer from '@/components/layout/Footer'

// Create a client component that handles verification
function VerificationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [timeLeft, setTimeLeft] = useState(5)
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  // Function to verify the email token
  const verifyEmailToken = async () => {
    const supabase = createClient()
    
    try {
      // Start tracking when the verification process began
      const verificationStartTime = Date.now()
      
      // Check if we have a token in the URL
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const code = searchParams.get('code') // Some email clients may pass code instead of token
      
      let verificationResult: 'success' | 'error' = 'error'
      let errorMsg = ''
      
      // Process the verification
      if ((!token && !code) && type === 'signup') {
        // This might be a redirect from our own callback handler
        // Check if we have a session already
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // If we have a session, the verification was likely successful
          verificationResult = 'success'
        } else {
          // No session, but we came from a "signup" verification flow
          // This is unusual - might be a browser issue or lost session
          errorMsg = 'Verification session not found. Please try logging in.'
        }
      } else if (!token && !code && !type) {
        // Direct access to the page with no parameters
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // User accessed the page directly but they're logged in
          verificationResult = 'success'
        } else {
          // User accessed the page directly with no session
          errorMsg = 'Invalid verification link. Please check your email again.'
        }
      } else {
        // We have a token or code, Supabase should have processed it already
        // Check if we have a session now
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          errorMsg = sessionError.message
        } else if (session) {
          // Token was valid and we have a session
          verificationResult = 'success'
        } else {
          // Token was processed but no session - probably expired or invalid
          errorMsg = 'This verification link has expired or is invalid. Please request a new one.'
        }
      }
      
      // Calculate how long the verification has taken so far
      const verificationDuration = Date.now() - verificationStartTime
      const minimumLoadingTime = 3500 // 3.5 seconds minimum loading time
      
      // If verification was quick, add artificial delay to show the loading animation
      if (verificationDuration < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - verificationDuration))
      }
      
      // Now update the state based on the verification result
      if (verificationResult === 'success') {
        setVerificationState('success')
      } else {
        throw new Error(errorMsg || 'An error occurred during verification. Please try again.')
      }
      
      // Start the countdown only after verification completes
      setCountdownStarted(true)
    } catch (error: any) {
      console.error('Verification error:', error)
      setVerificationState('error')
      setErrorMessage(error.message || 'An error occurred during verification. Please try again.')
      
      // Start the countdown even on error
      setCountdownStarted(true)
    }
  }

  useEffect(() => {
    // Verify the token when the component loads
    verifyEmailToken()
  }, [searchParams])
  
  // Set up countdown only after verification completes
  useEffect(() => {
    if (!countdownStarted) return
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [countdownStarted])

  // Handle redirect when timer ends
  useEffect(() => {
    if (timeLeft === 0) {
      const navigateUser = async () => {
        if (verificationState === 'success') {
          // Double-check we have a session before redirecting to dashboard
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            router.replace('/') 
          } else {
            // If somehow we lost the session, go to login
            console.error('Session not found on redirect')
            router.replace('/login')
          }
        } else {
          router.replace('/login')
        }
      }
      
      navigateUser()
    }
  }, [timeLeft, verificationState, router])

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
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4 font-serif">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* Fixed position container for logo */}
          <div className="w-36 h-36 relative z-20 mb-[-20px]">
            <div className="absolute inset-0">
              {/* Logo */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Google-style animated border container for loading state */}
                {verificationState === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border-4 border-[#C9A335] border-t-[#C9A335]/30 border-r-[#C9A335]/30 border-b-[#C9A335]/30 animate-spin"></div>
                  </div>
                )}
                
                {/* Static border containers for success/error states */}
                {verificationState === 'success' && (
                  <div className="absolute inset-0 rounded-full border-4 border-[#006633]"></div>
                )}
                
                {verificationState === 'error' && (
                  <div className="absolute inset-0 rounded-full border-4 border-[#7D1A1D]"></div>
                )}
                
                {/* Inner white background and image */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-lg z-10 m-auto">
                  <Image
                    src="/images/logo.svg"
                    alt="UPIS 84 Logo"
                    width={128}
                    height={128}
                    className="rounded-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card with fixed position relative to logo */}
          <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden w-full h-[320px] sm:h-[300px] flex flex-col">
            {/* Card Header - background changes based on verification state */}
            <div className={`text-white py-4 px-4 text-center
              ${verificationState === 'loading' ? 'bg-[#C9A335]' :
                verificationState === 'success' ? 'bg-[#006633]' : 'bg-[#7D1A1D]'}`}>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1 text-shadow">
                {verificationState === 'loading' 
                  ? 'Verifying Email' 
                  : verificationState === 'success' 
                    ? 'Email Verified!' 
                    : 'Verification Failed'}
              </h1>
              <p className="font-serif text-sm sm:text-base truncate text-shadow">
                {verificationState === 'loading' 
                  ? 'Please wait while we verify your email' 
                  : verificationState === 'success' 
                    ? 'Your email has been successfully verified' 
                    : 'Unable to verify your email address'}
              </p>
            </div>

            {/* Card Body with fixed height */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <div className="flex-1">
                {verificationState === 'loading' && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-700 text-center text-base sm:text-lg font-medium">
                      We're confirming your account
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base mt-2 text-center">
                      This will only take a moment
                    </p>
                  </div>
                )}
                
                {verificationState === 'error' && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 shadow-sm">
                      <AlertCircle size={18} />
                      <span className="font-medium text-sm sm:text-base">Try signing in again</span>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base text-center mt-3 mx-1 line-clamp-2">
                      {errorMessage}
                    </p>
                  </div>
                )}
                
                {verificationState === 'success' && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2 shadow-sm">
                      <CheckCircle size={18} />
                      <span className="font-medium text-sm sm:text-base">Welcome to the Alumni Portal</span>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base text-center mt-3">
                      You now have full access
                    </p>
                  </div>
                )}
              </div>
              
              {countdownStarted && (
                <div className="border-t border-gray-100 pt-3 mt-auto">
                  <p className="text-[#7D1A1D] font-medium text-center text-sm sm:text-lg">
                    Redirecting to {verificationState === 'success' ? 'dashboard' : 'login'} in 
                    <span className="inline-block mx-1 text-2xl sm:text-3xl font-bold bg-gray-100 rounded-full w-8 h-8 sm:w-10 sm:h-10 leading-8 sm:leading-10 shadow-sm">
                      {timeLeft}
                    </span> 
                    sec
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Use suspense boundary for the main page component
export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#E5DFD0",
          backgroundImage:
            "radial-gradient(#7D1A1D 0.5px, transparent 0.5px), radial-gradient(#C9A335 0.5px, #E5DFD0 0.5px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7D1A1D]"></div>
      </div>
    }>
      <VerificationContent />
    </Suspense>
  )
} 