"use client"

// Improved login flow with enhanced session verification and retry logic
// This implementation ensures proper redirection after auth state changes

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle, Loader2, ChevronDown } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { debounce } from "lodash"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from '@/components/layout/Footer'

export default function LoginSignupPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [suffix, setSuffix] = useState("")
  const [birthday, setBirthday] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+63") // Default to Philippines
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  const [firstNameFocused, setFirstNameFocused] = useState(false)
  const [middleNameFocused, setMiddleNameFocused] = useState(false)
  const [lastNameFocused, setLastNameFocused] = useState(false)
  const [suffixFocused, setSuffixFocused] = useState(false)
  const [birthdayFocused, setBirthdayFocused] = useState(false)
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false)
  
  // New state to track if any input has been interacted with
  const [formInteracted, setFormInteracted] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false)

  // Validation errors
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [birthdayError, setBirthdayError] = useState("")
  const [phoneNumberError, setPhoneNumberError] = useState("")
  const [termsError, setTermsError] = useState("")

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Add state for OTP input
  const [otp, setOtp] = useState("")
  const [otpFocused, setOtpFocused] = useState(false)

  const [emailAvailable, setEmailAvailable] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const supabase = createClient()

  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Keeping these effects for compatibility, but we'll use a more robust approach in the submit handler
  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        router.replace('/')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [loginSuccess, router])

  useEffect(() => {
    if (resetPasswordSuccess) {
      const timer = setTimeout(() => {
        setSuccess("")
        router.replace('/login')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [resetPasswordSuccess, router])

  // Email validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Birthday validation (must be appropriate for batch 1984)
  const validateBirthday = (birthday: string) => {
    if (!birthday) return false

    const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
    if (!dateRegex.test(birthday)) return false

    const parts = birthday.split("-")
    const birthDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)

    // For batch 1984, students would typically be born between 1945-1972
    const minYear = 1945
    const maxYear = 1972
    const birthYear = birthDate.getFullYear()

    return birthYear >= minYear && birthYear <= maxYear
  }

  // Phone number validation (based on selected country code)
  const validatePhoneNumber = (phone: string) => {
    // If empty, it's valid (since it's optional)
    if (!phone) return true
    
    // Check if it contains only digits and has a reasonable length
    const digitsOnly = phone.replace(/\D/g, "")
    return digitsOnly.length >= 5 && digitsOnly.length <= 15
  }

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")

    if (value.length > 8) {
      value = value.substring(0, 8)
    }

    // Format as MM-DD-YYYY
    if (value.length > 4) {
      value = `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4)}`
    } else if (value.length > 2) {
      value = `${value.substring(0, 2)}-${value.substring(2)}`
    }

    setBirthday(value)

    if (value.length === 10) {
      if (!validateBirthday(value)) {
        setBirthdayError("Birth year must be between 1945-1972 for Batch '84")
      } else {
        setBirthdayError("")
      }
    }
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, "")
    
    // Limit to 15 digits (E.164 international standard maximum)
    const limitedValue = value.substring(0, 15)
    
    setPhoneNumber(limitedValue)
    
    if (limitedValue && !validatePhoneNumber(limitedValue)) {
      setPhoneNumberError("Please enter a valid phone number")
    } else {
      setPhoneNumberError("")
    }
  }

  const debouncedCheckEmail = useRef(
    debounce(async (email: string) => {
      if (!email || !validateEmail(email)) return

      setIsCheckingEmail(true)
      try {
        // Use our custom function to check if email exists
        const { data: emailExists, error } = await supabase
          .rpc('check_email_exists', { email_to_check: email })

        if (error) throw error

        if (emailExists) {
          setEmailError("This email is already registered")
          setEmailAvailable(false)
        } else {
          setEmailError("")
          setEmailAvailable(true)
        }
      } catch (error: any) {
        console.error("Error checking email:", error)
        setEmailError("Error checking email availability")
        setEmailAvailable(false)
      } finally {
        setIsCheckingEmail(false)
      }
    }, 1000)
  ).current

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }

    // Only check email availability during signup
    if (!isLogin) {
      debouncedCheckEmail(value)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    // Check if confirm password matches
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError("Passwords do not match")
    } else {
      setPasswordError("")
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    
    // Check if passwords match
    if (value && password !== value) {
      setPasswordError("Passwords do not match")
    } else {
      setPasswordError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset interaction state on new form submission
    setFormInteracted(false)

    // Reset errors
    setError("")
    setEmailError("")
    setPasswordError("")
    setBirthdayError("")
    setPhoneNumberError("")
    setTermsError("")

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    // For signup, check if email is available before proceeding
    if (!isLogin && !emailAvailable) {
      setEmailError("This email is already registered")
      return
    }

    // Additional validations for signup
    if (!isLogin) {
      // Validate required fields
      if (!firstName || !lastName) {
        setError("First name and last name are required")
        return
      }

      // Validate birthday
      if (!validateBirthday(birthday)) {
        setBirthdayError("Please enter a valid birth date in MM-DD-YYYY format (1945-1972)")
        return
      }

      // Validate password match
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }

      // Validate terms acceptance
      if (!agreeToTerms) {
        setTermsError("You must agree to the terms and privacy policy")
        return
      }
    }

    // Validate phone number (only if provided)
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError("Please enter a valid phone number (5-15 digits)")
      return
    }

    // Record start time to ensure minimum loading duration
    const startTime = Date.now()
    const minimumLoadingTime = 2000 // 2 seconds minimum to show animation

    setLoading(true)
    setSuccess("")
    setLoginSuccess(false)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

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
            // Verify the session is available
            const { data } = await supabase.auth.getSession()
            
            if (data.session) {
              // Session is confirmed, navigate
              window.location.href = '/'
            } else if (attempts < maxAttempts) {
              // Try again after a delay
              setTimeout(checkAndNavigate, 500)
            } else {
              // Last resort fallback
              window.location.href = '/'
            }
          } catch (err) {
            console.error("Session check error:", err)
            // Fallback if there's an error checking session
            if (attempts < maxAttempts) {
              setTimeout(checkAndNavigate, 500)
            } else {
              window.location.href = '/'
            }
          }
        }
        
        // Start the check process after showing success message
        setTimeout(checkAndNavigate, 1000)
      } else {
        // Double-check email availability before signup
        const { error: checkError } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false }
        })

        if (!checkError || checkError.message.includes("Email not confirmed")) {
          setEmailError("This email is already registered")
          setLoading(false)
          return
        }

        // Combine name fields for metadata
        const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}${suffix ? ' ' + suffix : ''}`
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              middle_name: middleName,
              last_name: lastName,
              suffix: suffix,
              full_name: fullName,
              birthday,
              phone_number: `${countryCode}${phoneNumber}`,
            },
            emailRedirectTo: `${window.location.origin}/verify-email`,
          },
        })

        if (error) throw error

        // Ensure minimum loading time for animation
        const elapsedTime = Date.now() - startTime
        if (elapsedTime < minimumLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
        }

        setSuccess("Account created - check your email to verify")
      }
    } catch (error: any) {
      // Ensure minimum loading time for animation even on error
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }
      
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (otp: string) => {
    if (!email || !otp) {
      setError("Please enter the verification code")
      return
    }

    // Record start time to ensure minimum loading duration
    const startTime = Date.now()
    const minimumLoadingTime = 2000 // 2 seconds minimum to show animation

    setLoading(true)
    // Set success to true to ensure correct loading state display
    setSuccess("verifying") 
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      })

      if (error) throw error

      // Ensure minimum loading time for animation
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }

      setIsVerified(true)
      setError("")
      setSuccess("Code verified successfully")
    } catch (error: any) {
      // Ensure minimum loading time for animation even on error
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }
      
      console.error("OTP verification error:", error)
      setError(error.message || "Invalid verification code. Please try again.")
      setSuccess("")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset interaction state on new form submission
    setFormInteracted(false)
    
    // Reset errors and success
    setError("")
    setEmailError("")

    // Only proceed with sending OTP if we're not already in verification or reset state
    if (!success) {
      // Validate email
      if (!validateEmail(email)) {
        setEmailError("Please enter a valid email address")
        return
      }

      // Record start time to ensure minimum loading duration
      const startTime = Date.now()
      const minimumLoadingTime = 2000 // 2 seconds minimum to show animation

      setLoading(true)
      setSuccess("")

      try {
        // First check if email exists
        const { data: emailExists, error: checkError } = await supabase
          .rpc('check_email_exists', { email_to_check: email })

        if (checkError) throw checkError

        if (!emailExists) {
          throw new Error("No account found with this email")
        }

        // Send OTP using signInWithOtp instead of resetPasswordForEmail
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          }
        })

        if (error) throw error

        // Ensure minimum loading time for animation
        const elapsedTime = Date.now() - startTime
        if (elapsedTime < minimumLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
        }

        setSuccess("Verification code sent to your email")
      } catch (error: any) {
        // Ensure minimum loading time for animation even on error
        const elapsedTime = Date.now() - startTime
        if (elapsedTime < minimumLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
        }
        
        console.error("Password reset request error:", error)
        setError(error.message || "Failed to send verification code")
        setSuccess("")
      } finally {
        setLoading(false)
      }
    } else if (success && !isVerified) {
      // Handle OTP verification
      await handleVerifyOTP(otp)
    } else if (isVerified) {
      // Handle password reset
      await handleResetPassword(e)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isVerified) {
      setError("Please verify your email first")
      return
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    // Record start time to ensure minimum loading duration
    const startTime = Date.now()
    const minimumLoadingTime = 2000 // 2 seconds minimum to show animation

    setLoading(true)
    // Set success to ensure correct loading state in header 
    setSuccess("setting")
    try {
      const { error } = await supabase.auth.updateUser({ 
        password 
      })

      if (error) throw error

      // Ensure minimum loading time for animation
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }

      setError("")
      setSuccess("Password set successfully")
      
      // Sign out the user after successful password reset
      await supabase.auth.signOut()
      
      // Show success state for 2 seconds before reset
      setResetPasswordSuccess(true)
      
      // Reset form after a delay
      setTimeout(() => {
        // Reset all states
        setIsForgotPassword(false)
        setIsVerified(false)
        setIsLogin(true)
        setPassword("")
        setConfirmPassword("")
        setOtp("")
        setEmail("")
        setError("")
        setPasswordError("")
        setFormInteracted(false)
        setSuccess("")
        
        // Navigate to login page
        router.replace('/login')
      }, 2000)
    } catch (error: any) {
      // Ensure minimum loading time for animation even on error
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime))
      }
      
      console.error("Password reset error:", error)
      setError(error.message || "Failed to update password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setIsForgotPassword(false)
    setIsResetPassword(false)
    setIsVerified(false)
    // Reset form and messages
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
    setEmailError("")
    setEmailAvailable(false)
    // Reset form interaction state when switching modes
    setFormInteracted(false)
  }

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword)
    setIsVerified(false)
    setIsLogin(true)
    // Reset form and messages
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
    setOtp("")
    // Reset form interaction state when switching modes
    setFormInteracted(false)
  }

  const countryCodes = [
    { code: "+63", name: "Philippines" },
    { code: "+1", name: "United States/Canada" },
    { code: "+44", name: "United Kingdom" },
    { code: "+61", name: "Australia" },
    { code: "+65", name: "Singapore" },
    { code: "+81", name: "Japan" },
    { code: "+82", name: "South Korea" },
    { code: "+49", name: "Germany" },
    { code: "+33", name: "France" },
    { code: "+39", name: "Italy" },
    { code: "+34", name: "Spain" },
    { code: "+41", name: "Switzerland" },
    { code: "+31", name: "Netherlands" },
    { code: "+46", name: "Sweden" },
    { code: "+47", name: "Norway" },
    { code: "+45", name: "Denmark" },
    { code: "+64", name: "New Zealand" },
    { code: "+852", name: "Hong Kong" },
    { code: "+886", name: "Taiwan" },
    { code: "+971", name: "UAE" },
    { code: "+966", name: "Saudi Arabia" },
    { code: "+974", name: "Qatar" },
    { code: "+965", name: "Kuwait" },
    { code: "+973", name: "Bahrain" },
    { code: "+968", name: "Oman" },
  ]

  // Helper to mark form as interacted when any input gets focus
  const handleInputFocus = (setFocusedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setFormInteracted(true)
    setFocusedState(true)
  }
  
  // Helper for onBlur that keeps the focus state but updates the visual focus
  const handleInputBlur = (setFocusedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setFocusedState(false)
    // We keep formInteracted true to maintain the default state 
  }

  // Helper function to truncate error messages
  const truncateMessage = (message: string, maxLength: number = 40) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
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
      <Header />
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 font-serif">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-0 relative z-10">
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              {/* Google-style animated border container for loading state */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border-4 border-[#C9A335] border-t-[#C9A335]/30 border-r-[#C9A335]/30 border-b-[#C9A335]/30 animate-spin"></div>
                </div>
              )}
              
              {/* Static border containers for success/error states - only show when not interacted with form */}
              {success && !error && !loading && (!formInteracted || isForgotPassword) && (
                <div className="absolute inset-0 rounded-full border-4 border-[#006633]"></div>
              )}
              
              {error && !loading && (!formInteracted || isForgotPassword) && (
                <div className="absolute inset-0 rounded-full border-4 border-[#7D1A1D]"></div>
              )}
              
              {/* Default border when no state is active or when form has been interacted with */}
              {((!loading && !success && !error) || (formInteracted && !isForgotPassword)) && (
                <div className="absolute inset-0 rounded-full border-2 border-[#C9A335]"></div>
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

          {/* Card */}
          <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden mt-[-1rem]">
            {/* Card Header - background changes based on state */}
            <div className={`text-white py-3 md:py-4 px-4 md:px-6 text-center min-h-[80px] flex flex-col justify-center items-center
              ${loading ? 'bg-[#C9A335]' :
              success && !error && !formInteracted && !isForgotPassword ? 'bg-[#006633]' : 
              success && !error && isForgotPassword ? 'bg-[#006633]' :
              error && !formInteracted && !isForgotPassword ? 'bg-[#a01a1d]' : 
              error && isForgotPassword ? 'bg-[#a01a1d]' :
              'bg-[#7D1A1D]'}`}>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 text-shadow">
                {loading ? (
                  isForgotPassword ? 
                    !success ? "Sending OTP..." : 
                    success === "verifying" ? "Verifying OTP..." :
                    success === "setting" ? "Setting Password..." :
                    !isVerified ? "Verifying OTP..." : 
                    "Setting Password..." 
                  : isLogin ? "Logging In..." : "Signing Up..."
                ) : success && !error && (isForgotPassword || !formInteracted) ? (
                  isForgotPassword ? (
                    isVerified ? 
                      resetPasswordSuccess ? "Password Set" : "Set Password" 
                    : "Input OTP"
                  ) : 
                  isLogin ? "Login Successful" : "Signup Successful"
                ) : error && (isForgotPassword || !formInteracted) ? (
                  "Authentication Failed"
                ) : (
                  isForgotPassword ? "Reset Password" : isLogin ? "Welcome to Sulyap84" : "Join Sulyap84"
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
                  loading ? (
                    isForgotPassword ? 
                      !success ? "Sending verification code" :
                      success === "verifying" ? "Verifying your code" :
                      success === "setting" ? "Setting your password" :
                      !isVerified ? "Verifying your code" :
                      "Setting your password"
                    : "Processing your request"
                  ) : success && !error && (isForgotPassword || !formInteracted) ? (
                    isForgotPassword ? (
                      isVerified ? 
                        resetPasswordSuccess ? "Password set successfully" : "Enter new password" 
                      : "Enter verification code"
                    ) : success
                  ) : error && (isForgotPassword || !formInteracted) ? (
                    truncateMessage(error)
                  ) : (
                    "Reconnecting Our Past, Empowering Our Future"
                  )
                }
              >
                {loading ? (
                  isForgotPassword ? 
                    !success ? "Sending verification code" :
                    success === "verifying" ? "Verifying your code" :
                    success === "setting" ? "Setting your password" :
                    !isVerified ? "Verifying your code" :
                    "Setting your password"
                  : "Processing your request"
                ) : success && !error && (isForgotPassword || !formInteracted) ? (
                  isForgotPassword ? (
                    isVerified ? 
                      resetPasswordSuccess ? "Password set successfully" : "Enter new password" 
                    : "Enter verification code"
                  ) : success
                ) : error && (isForgotPassword || !formInteracted) ? (
                  truncateMessage(error)
                ) : (
                  "Reconnecting Our Past, Empowering Our Future"
                )}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
                {/* Show different content based on mode */}
                {isForgotPassword ? (
                  <>
                    <div className="mb-4">
                      {!success && !isVerified && (
                        <div className="relative">
                          <input
                            id="forgotEmail"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            onFocus={() => handleInputFocus(setEmailFocused)}
                            onBlur={() => handleInputBlur(setEmailFocused)}
                            className={cn(
                              "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                              emailFocused || email ? "border-[#7D1A1D]" : "border-gray-300",
                              emailError ? "border-red-500" : "",
                            )}
                            required
                          />
                          <label
                            htmlFor="forgotEmail"
                            className={cn(
                              "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                              emailFocused || email
                                ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                                : "top-2.5",
                            )}
                          >
                            Email Address
                          </label>
                          {emailError && <p className="mt-1 text-xs text-red-500">{truncateMessage(emailError)}</p>}
                        </div>
                      )}

                      {/* OTP Input - Only show after email is sent and before verification */}
                      {success && !isVerified && (
                        <div className="relative mt-4">
                          <input
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            onFocus={() => handleInputFocus(setOtpFocused)}
                            onBlur={() => handleInputBlur(setOtpFocused)}
                            className={cn(
                              "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                              otpFocused || otp ? "border-[#7D1A1D]" : "border-gray-300",
                            )}
                            placeholder=""
                            maxLength={6}
                            required
                          />
                          <label
                            htmlFor="otp"
                            className={cn(
                              "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                              otpFocused || otp
                                ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                                : "top-2.5",
                            )}
                          >
                            Enter 6-digit code
                          </label>
                        </div>
                      )}

                      {/* Password Reset Fields - Only show after verification */}
                      {isVerified && (
                        <>
                          {/* New Password Field */}
                          <div className="relative mb-4">
                            <input
                              id="newPassword"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={handlePasswordChange}
                              onFocus={() => handleInputFocus(setPasswordFocused)}
                              onBlur={() => handleInputBlur(setPasswordFocused)}
                              className={cn(
                                "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                                passwordFocused || password ? "border-[#7D1A1D]" : "border-gray-300",
                                passwordError ? "border-red-500" : "",
                              )}
                              required
                            />
                            <label
                              htmlFor="newPassword"
                              className={cn(
                                "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                                passwordFocused || password
                                  ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                                  : "top-2.5",
                              )}
                            >
                              New Password
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
                          </div>

                          {/* Confirm New Password Field */}
                          <div className="relative">
                            <input
                              id="confirmNewPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={handleConfirmPasswordChange}
                              onFocus={() => handleInputFocus(setConfirmPasswordFocused)}
                              onBlur={() => handleInputBlur(setConfirmPasswordFocused)}
                              className={cn(
                                "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                                confirmPasswordFocused || confirmPassword ? "border-[#7D1A1D]" : "border-gray-300",
                                password !== confirmPassword && confirmPassword ? "border-red-500" : "",
                              )}
                              required
                            />
                            <label
                              htmlFor="confirmNewPassword"
                              className={cn(
                                "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                                confirmPasswordFocused || confirmPassword
                                  ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                                  : "top-2.5",
                              )}
                            >
                              Confirm New Password
                            </label>
                            {confirmPassword && (
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                              >
                                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                              </button>
                            )}
                            {passwordError && <p className="mt-1 text-xs text-red-500">{truncateMessage(passwordError)}</p>}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-[#7D1A1D] hover:bg-[#6a1518] text-white py-3 rounded-md transition-colors"
                      disabled={Boolean(loading || (success && !isVerified && otp.length !== 6) || (isVerified && (!password || !confirmPassword)))}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {!success ? "Sending OTP..." : !isVerified ? "Verifying OTP..." : "Setting Password..."}
                        </span>
                      ) : isVerified ? (
                        <span className="text-lg font-medium">Set Password</span>
                      ) : success ? (
                        <span className="text-lg font-medium">Verify Code</span>
                      ) : (
                        <span className="text-lg font-medium">Send OTP</span>
                      )}
                    </Button>

                    {/* Remember Password Link */}
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={toggleForgotPassword}
                        className="text-sm text-[#7D1A1D] hover:underline font-medium font-serif"
                      >
                        I remember my password
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {!isLogin && (
                      <>
                        {/* Name Fields */}
                        <div className="space-y-2">
                          <p className="text-xs text-[#004d27] font-serif font-medium mb-1">Please use your high school maiden name</p>
                          
                          {/* First row: First Name and Middle Name */}
                          <div className="grid grid-cols-12 gap-2 mb-2">
                            {/* First Name */}
                            <div className="relative col-span-7">
                              <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                onFocus={() => handleInputFocus(setFirstNameFocused)}
                                onBlur={() => handleInputBlur(setFirstNameFocused)}
                                className={cn(
                                  "block w-full px-3 py-1.5 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                                  firstNameFocused || firstName ? "border-[#7D1A1D]" : "border-gray-300",
                                )}
                                required
                              />
                              <label
                                htmlFor="firstName"
                                className={cn(
                                  "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                                  firstNameFocused || firstName
                                    ? "transform -translate-y-[1rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                                    : "top-2.5",
                                )}
                              >
                                First Name
                              </label>
                            </div>

                            {/* Middle Name */}
                            <div className="relative col-span-5">
                              <input
                                id="middleName"
                                type="text"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                onFocus={() => handleInputFocus(setMiddleNameFocused)}
                                onBlur={() => handleInputBlur(setMiddleNameFocused)}
                                className={cn(
                                  "block w-full px-3 py-1.5 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                                  middleNameFocused || middleName ? "border-[#7D1A1D]" : "border-gray-300",
                                )}
                              />
                              <label
                                htmlFor="middleName"
                                className={cn(
                                  "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                                  middleNameFocused || middleName
                                    ? "transform -translate-y-[1rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                                    : "top-2.5",
                                )}
                              >
                                Middle Name
                              </label>
                            </div>
                          </div>

                          {/* Second row: Last Name and Suffix */}
                          <div className="grid grid-cols-12 gap-2">
                            {/* Last Name */}
                            <div className="relative col-span-9">
                              <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                onFocus={() => handleInputFocus(setLastNameFocused)}
                                onBlur={() => handleInputBlur(setLastNameFocused)}
                                className={cn(
                                  "block w-full px-3 py-1.5 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                                  lastNameFocused || lastName ? "border-[#7D1A1D]" : "border-gray-300",
                                )}
                                required
                              />
                              <label
                                htmlFor="lastName"
                                className={cn(
                                  "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                                  lastNameFocused || lastName
                                    ? "transform -translate-y-[1rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                                    : "top-2.5",
                                )}
                              >
                                Last Name
                              </label>
                            </div>

                            {/* Suffix */}
                            <div className="relative col-span-3">
                              <input
                                id="suffix"
                                type="text"
                                value={suffix}
                                onChange={(e) => setSuffix(e.target.value)}
                                onFocus={() => handleInputFocus(setSuffixFocused)}
                                onBlur={() => handleInputBlur(setSuffixFocused)}
                                className={cn(
                                  "block w-full px-3 py-1.5 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                                  suffixFocused || suffix ? "border-[#7D1A1D]" : "border-gray-300",
                                )}
                              />
                              <label
                                htmlFor="suffix"
                                className={cn(
                                  "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                                  suffixFocused || suffix
                                    ? "transform -translate-y-[1rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                                    : "top-2.5",
                                )}
                              >
                                Suffix
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Birthday Field */}
                        <div className="relative">
                          <input
                            id="birthday"
                            type="text"
                            value={birthday}
                            onChange={handleBirthdayChange}
                            onFocus={() => handleInputFocus(setBirthdayFocused)}
                            onBlur={() => handleInputBlur(setBirthdayFocused)}
                            placeholder=""
                            maxLength={10}
                            className={cn(
                              "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                              birthdayFocused || birthday ? "border-[#7D1A1D]" : "border-gray-300",
                              birthdayError ? "border-red-500" : "",
                            )}
                            required
                          />
                          <label
                            htmlFor="birthday"
                            className={cn(
                              "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                              birthdayFocused || birthday
                                ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                                : "top-2.5",
                            )}
                          >
                            Birthday (MM-DD-YYYY)
                          </label>
                          {birthdayError && <p className="mt-1 text-xs text-red-500">{truncateMessage(birthdayError)}</p>}
                        </div>

                        {/* Phone Number Field */}
                        <div className="relative">
                          <div className="flex">
                            {/* Country Code Selector */}
                            <div className="relative" ref={dropdownRef}>
                              <button
                                type="button"
                                className="flex items-center justify-between h-full px-3 py-2 text-gray-700 bg-white border border-r-0 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200"
                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                              >
                                <span>{countryCode}</span>
                                <ChevronDown className="ml-1 h-4 w-4" />
                              </button>
                              
                              {/* Dropdown */}
                              {showCountryDropdown && (
                                <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                                  <ul className="py-1 max-h-60 overflow-auto">
                                    {countryCodes.map((country) => (
                                      <li 
                                        key={country.code}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                        onClick={() => {
                                          setCountryCode(country.code)
                                          setShowCountryDropdown(false)
                                        }}
                                      >
                                        <span className="font-medium">{country.code}</span> {country.name}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            {/* Phone Number Input */}
                            <input
                              id="phoneNumber"
                              type="text"
                              value={phoneNumber}
                              onChange={handlePhoneNumberChange}
                              onFocus={() => handleInputFocus(setPhoneNumberFocused)}
                              onBlur={() => {
                                handleInputBlur(setPhoneNumberFocused)
                                setShowCountryDropdown(false)
                              }}
                              className={cn(
                                "block w-full px-4 py-2 text-black bg-white border border-l-0 rounded-r-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                                phoneNumberFocused || phoneNumber ? "border-[#7D1A1D]" : "border-gray-300",
                                phoneNumberError ? "border-red-500" : "",
                              )}
                            />
                          </div>
                          <label
                            htmlFor="phoneNumber"
                            className={cn(
                              "absolute left-16 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                              phoneNumberFocused || phoneNumber
                                ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                                : "top-2.5",
                            )}
                          >
                            Phone Number
                          </label>
                          
                          {phoneNumberError && <p className="mt-1 text-xs text-red-500">{truncateMessage(phoneNumberError)}</p>}
                        </div>
                      </>
                    )}

                    {/* Email Field */}
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        className={cn(
                          "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                          emailFocused || email ? "border-[#7D1A1D]" : "border-gray-300",
                          emailError ? "border-red-500" : "",
                        )}
                        required
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onFocus={() => handleInputFocus(setEmailFocused)}
                        onBlur={() => handleInputBlur(setEmailFocused)}
                        autoComplete="email"
                      />
                      <label
                        htmlFor="email"
                        className={cn(
                          "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                          emailFocused || email
                            ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                            : "top-2.5",
                        )}
                      >
                        Email Address
                      </label>
                      {emailError && <p className="mt-1 text-xs text-red-500">{truncateMessage(emailError)}</p>}
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        onFocus={() => handleInputFocus(setPasswordFocused)}
                        onBlur={() => handleInputBlur(setPasswordFocused)}
                        className={cn(
                          "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                          passwordFocused || password ? "border-[#7D1A1D]" : "border-gray-300",
                          passwordError ? "border-red-500" : "",
                        )}
                        required
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
                    </div>

                    {!isLogin && (
                      <>
                        {/* Confirm Password Field */}
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            onFocus={() => handleInputFocus(setConfirmPasswordFocused)}
                            onBlur={() => handleInputBlur(setConfirmPasswordFocused)}
                            className={cn(
                              "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                              confirmPasswordFocused || confirmPassword ? "border-[#7D1A1D]" : "border-gray-300",
                              password !== confirmPassword && confirmPassword ? "border-red-500" : "",
                            )}
                            required
                          />
                          <label
                            htmlFor="confirmPassword"
                            className={cn(
                              "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                              confirmPasswordFocused || confirmPassword
                                ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                                : "top-2.5",
                            )}
                          >
                            Confirm Password
                          </label>
                          {confirmPassword && (
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                          )}
                        </div>

                        {/* Terms and Privacy Policy Checkbox */}
                        <div className="flex items-start space-x-2 mt-4">
                          <Checkbox
                            id="terms"
                            checked={agreeToTerms}
                            onCheckedChange={(checked) => {
                              setAgreeToTerms(checked as boolean)
                              if (checked) setTermsError("")
                            }}
                            className="mt-1 data-[state=checked]:bg-[#7D1A1D] data-[state=checked]:border-[#7D1A1D]"
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="terms"
                              className="text-sm font-medium leading-tight text-gray-600 font-serif peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              I agree to the <Link href="/privacy-policy" className="text-[#7D1A1D] hover:underline">Privacy Policy</Link> and <Link href="/terms-of-use" className="text-[#7D1A1D] hover:underline">Terms of Use</Link>
                            </label>
                            <p className="text-xs text-gray-600 font-serif">
                              I understand that my provided information will be used to create a personalized alumni
                              directory and enhance community interactions.
                            </p>
                            {termsError && <p className="text-xs text-red-500">{truncateMessage(termsError)}</p>}
                          </div>
                        </div>
                      </>
                    )}

                    {isLogin && (
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
                              Keep me logged in
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

                    <Button
                      type="submit"
                      className="w-full bg-[#7D1A1D] hover:bg-[#6a1518] text-white py-3 rounded-md transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isLogin ? "Logging In..." : "Signing Up..."}
                        </span>
                      ) : isLogin ? (
                        <span className="text-lg font-medium">Sign In</span>
                      ) : (
                        <span className="text-lg font-medium">Sign Up</span>
                      )}
                    </Button>
                  </>
                )}

                {!isForgotPassword && (
                  <div className="mt-6 text-center">
                    <p className="text-gray-600 font-serif">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="ml-1 text-[#7D1A1D] hover:underline font-medium font-serif"
                      >
                        {isLogin ? "Sign Up" : "Sign In"}
                      </button>
                    </p>
                  </div>
                )}

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
        </div>
      </main>

      {/* Add text-shadow utility class */}
      <style jsx global>{`
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <Footer />
    </div>
  )
}