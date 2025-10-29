"use client"

// Simplified login with username/password authentication
// Admin creates all accounts - no signup flow

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [keepLoggedIn, setKeepLoggedIn] = useState(true) // Default to true for 30-day session

  const [usernameFocused, setUsernameFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const [formInteracted, setFormInteracted] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Validation errors
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Password visibility
  const [showPassword, setShowPassword] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        router.replace('/')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [loginSuccess, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setFormInteracted(false)
    setError("")
    setUsernameError("")
    setPasswordError("")

    // Validate username
    if (!username || username.trim().length < 2) {
      setUsernameError("Please enter a valid username")
      return
    }

    // Validate password
    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    const startTime = Date.now()
    const minimumLoadingTime = 2000

    setLoading(true)
    setSuccess("")
    setLoginSuccess(false)

    try {
      // Step 1: Look up username to get email
      console.log('Looking up username:', username.toLowerCase().trim())
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, account_status')
        .eq('username', username.toLowerCase().trim())
        .single()

      console.log('Profile lookup result:', { profileData, profileError })

      if (profileError || !profileData) {
        console.error('Profile lookup failed:', profileError)
        throw new Error("Invalid username or password")
      }

      console.log('Found email:', profileData.email, 'Status:', profileData.account_status)

      // Check account status
      if (profileData.account_status === 'Inactive') {
        throw new Error("Your account has been deactivated. Please contact an administrator.")
      }

      if (profileData.account_status === 'Deceased') {
        throw new Error("This account is marked as deceased and cannot be accessed.")
      }

      // Step 2: Use email to authenticate with Supabase
      console.log('Attempting auth with email:', profileData.email)
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      })

      if (authError) {
        console.error('Auth failed:', authError)
        throw new Error("Invalid username or password")
      }

      console.log('Authentication successful!')

      setSuccess("Login successful")

      // Ensure minimum loading time for animation
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }

      // Enhanced navigation with retry logic
      let attempts = 0
      const maxAttempts = 3

      const checkAndNavigate = async () => {
        attempts++
        try {
          const { data } = await supabase.auth.getSession()

          if (data.session) {
            window.location.href = '/'
          } else if (attempts < maxAttempts) {
            setTimeout(checkAndNavigate, 500)
          } else {
            window.location.href = '/'
          }
        } catch (err) {
          console.error("Session check error:", err)
          if (attempts < maxAttempts) {
            setTimeout(checkAndNavigate, 500)
          } else {
            window.location.href = '/'
          }
        }
      }

      setTimeout(checkAndNavigate, 1000)
    } catch (error: any) {
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }

      setError(error.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    setFormInteracted(false)
    setError("")
    setUsernameError("")

    if (!username || username.trim().length < 2) {
      setUsernameError("Please enter your username")
      return
    }

    const startTime = Date.now()
    const minimumLoadingTime = 2000

    setLoading(true)
    setSuccess("")

    try {
      // Check if username exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('username', username.toLowerCase().trim())
        .single()

      if (profileError || !profileData) {
        throw new Error("Username not found")
      }

      // TODO: Create password reset notification for admins
      // For now, just show a message

      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }

      setSuccess("Password reset request sent to administrators")
    } catch (error: any) {
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }

      setError(error.message || "Failed to process request")
    } finally {
      setLoading(false)
    }
  }

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword)
    setUsername("")
    setPassword("")
    setError("")
    setSuccess("")
    setFormInteracted(false)
  }

  const handleInputFocus = (setFocusedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setFormInteracted(true)
    setFocusedState(true)
  }

  const handleInputBlur = (setFocusedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setFocusedState(false)
  }

  const truncateMessage = (message: string, maxLength: number = 40) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 font-serif text-[#7D1A1D]">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-0 relative z-10">
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Animated border for loading */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-4 border-[#C9A335] border-t-[#C9A335]/30 border-r-[#C9A335]/30 border-b-[#C9A335]/30 animate-spin"></div>
              </div>
            )}

            {/* Success border */}
            {success && !error && !loading && (!formInteracted || isForgotPassword) && (
              <div className="absolute inset-0 rounded-full border-4 border-[#006633]"></div>
            )}

            {/* Error border */}
            {error && !loading && (!formInteracted || isForgotPassword) && (
              <div className="absolute inset-0 rounded-full border-4 border-[#7D1A1D]"></div>
            )}

            {/* Default border */}
            {((!loading && !success && !error) || (formInteracted && !isForgotPassword)) && (
              <div className="absolute inset-0 rounded-full border-2 border-[#C9A335]"></div>
            )}

            {/* Logo image */}
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

        {/* Card */}
        <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden mt-[-1rem]">
          {/* Card Header */}
          <div className={`text-white py-3 md:py-4 px-4 md:px-6 text-center min-h-[80px] flex flex-col justify-center items-center
            ${loading ? 'bg-[#C9A335]' :
            success && !error && !formInteracted && !isForgotPassword ? 'bg-[#006633]' :
            success && !error && isForgotPassword ? 'bg-[#006633]' :
            error && !formInteracted && !isForgotPassword ? 'bg-[#a01a1d]' :
            error && isForgotPassword ? 'bg-[#a01a1d]' :
            'bg-[#7D1A1D]'}`}>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 text-shadow">
              {loading ? (
                isForgotPassword ? "Processing Request..." : "Logging In..."
              ) : success && !error && (isForgotPassword || !formInteracted) ? (
                isForgotPassword ? "Request Sent" : "Login Successful"
              ) : error && (isForgotPassword || !formInteracted) ? (
                "Authentication Failed"
              ) : (
                isForgotPassword ? "Reset Password" : "Welcome to Sulyap84"
              )}
            </h1>
            <p
              className="font-serif text-xs md:text-sm truncate text-shadow text-center mx-auto w-full"
              style={{
                maxWidth: "100%",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden"
              }}
              title={
                loading ? "Processing your request" :
                success && !error && (isForgotPassword || !formInteracted) ? success :
                error && (isForgotPassword || !formInteracted) ? truncateMessage(error) :
                "Reconnecting Our Past, Empowering Our Future"
              }
            >
              {loading ? "Processing your request" :
                success && !error && (isForgotPassword || !formInteracted) ? success :
                error && (isForgotPassword || !formInteracted) ? truncateMessage(error) :
                "Reconnecting Our Past, Empowering Our Future"
              }
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => handleInputFocus(setUsernameFocused)}
                  onBlur={() => handleInputBlur(setUsernameFocused)}
                  className={cn(
                    "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                    usernameFocused || username ? "border-[#7D1A1D]" : "border-gray-300",
                    usernameError ? "border-red-500" : "",
                  )}
                  required
                  autoComplete="username"
                />
                <label
                  htmlFor="username"
                  className={cn(
                    "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                    usernameFocused || username
                      ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                      : "top-2.5",
                  )}
                >
                  Username
                </label>
                {usernameError && <p className="mt-1 text-xs text-red-500">{truncateMessage(usernameError)}</p>}
              </div>

              {/* Password Field - Only show if not forgot password mode */}
              {!isForgotPassword && (
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => handleInputFocus(setPasswordFocused)}
                    onBlur={() => handleInputBlur(setPasswordFocused)}
                    className={cn(
                      "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                      passwordFocused || password ? "border-[#7D1A1D]" : "border-gray-300",
                      passwordError ? "border-red-500" : "",
                    )}
                    required
                    autoComplete="current-password"
                  />
                  <label
                    htmlFor="password"
                    className={cn(
                      "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                      passwordFocused || password
                        ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                        : "top-2.5",
                    )}
                  >
                    Password
                  </label>
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  )}
                  {passwordError && <p className="mt-1 text-xs text-red-500">{truncateMessage(passwordError)}</p>}
                </div>
              )}

              {/* Keep me logged in and Forgot password */}
              {!isForgotPassword && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="keepLoggedIn"
                        checked={keepLoggedIn}
                        onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                        className="data-[state=checked]:bg-[#7D1A1D] data-[state=checked]:border-[#7D1A1D]"
                      />
                      <label
                        htmlFor="keepLoggedIn"
                        className="text-sm font-medium leading-none text-[#004d27] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Keep me logged in (30 days)
                      </label>
                    </div>
                    <div className="sm:hidden">
                      <button
                        type="button"
                        onClick={toggleForgotPassword}
                        className="text-sm text-[#7D1A1D] hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <button
                      type="button"
                      onClick={toggleForgotPassword}
                      className="text-sm text-[#7D1A1D] hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#7D1A1D] hover:bg-[#6a1518] text-white py-3 rounded-md transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isForgotPassword ? "Processing..." : "Logging In..."}
                  </span>
                ) : isForgotPassword ? (
                  <span className="text-lg font-medium">Request Reset</span>
                ) : (
                  <span className="text-lg font-medium">Sign In</span>
                )}
              </Button>

              {/* Back to login link for forgot password */}
              {isForgotPassword && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="text-sm text-[#7D1A1D] hover:underline font-medium font-serif"
                  >
                    Back to Login
                  </button>
                </div>
              )}

              {/* Footer links */}
              <div className="mt-4 text-center">
                <Link href="/privacy-policy" className="text-xs text-[#7D1A1D] hover:underline font-serif">
                  Privacy Policy
                </Link>
                <span className="text-xs text-gray-500 mx-2 font-serif">|</span>
                <Link href="/terms-of-use" className="text-xs text-[#7D1A1D] hover:underline font-serif">
                  Terms of Use
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Text shadow utility */}
        <style jsx global>{`
          .text-shadow {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </div>
  )
}
