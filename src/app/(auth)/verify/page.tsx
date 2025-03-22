'use client'

import { useEffect } from 'react'

export default function VerificationSuccess() {
  useEffect(() => {
    // Create a broadcast channel for cross-window communication
    const channel = new BroadcastChannel('auth-channel')
    
    // Send verification success message immediately
    channel.postMessage({ type: 'VERIFICATION_SUCCESS' })
    
    return () => {
      channel.close()
    }
  }, [])

  const handleReturn = () => {
    if (window.opener) {
      try {
        // Try to focus and navigate the opener window
        window.opener.focus()
        window.opener.location.href = '/'
        // Close this window
        window.close()
      } catch (e) {
        // Fallback: just redirect this window
        window.location.href = '/'
      }
    } else {
      // If no opener, redirect this window
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified Successfully!</h2>
        <p className="text-gray-600 mb-6">Click the button below to return to the main window.</p>
        <button
          onClick={handleReturn}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Return to Main Window
        </button>
      </div>
    </div>
  )
} 