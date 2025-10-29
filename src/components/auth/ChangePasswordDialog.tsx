"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { createClient } from "@/utils/supabase/client"

interface ChangePasswordDialogProps {
  userId: string
  onSuccess: () => void
}

export default function ChangePasswordDialog({ userId, onSuccess }: ChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const [newPasswordFocused, setNewPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setPasswordError("")

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    // Validate password length (simple validation for elderly users)
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      // Update must_change_password flag to false
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', userId)

      if (profileError) throw profileError

      onSuccess()
    } catch (error: any) {
      console.error('Password change error:', error)
      setError(error.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#7D1A1D] text-white py-4 px-6 text-center">
          <h2 className="text-xl md:text-2xl font-serif font-bold mb-1">Change Your Password</h2>
          <p className="text-sm font-serif">
            Please set a new password to continue
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Info message */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
              For security, please change your default password.
            </div>

            {/* New Password Field */}
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setNewPasswordFocused(true)}
                onBlur={() => setNewPasswordFocused(false)}
                className={cn(
                  "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                  newPasswordFocused || newPassword ? "border-[#7D1A1D]" : "border-gray-300",
                  passwordError ? "border-red-500" : "",
                )}
                required
              />
              <label
                htmlFor="newPassword"
                className={cn(
                  "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm whitespace-nowrap",
                  newPasswordFocused || newPassword
                    ? "transform -translate-y-[1.2rem] scale-[0.7] text-[#7D1A1D] bg-white px-1 top-2.5 origin-[0]"
                    : "top-2.5",
                )}
              >
                New Password
              </label>
              {newPassword && (
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                className={cn(
                  "block w-full px-4 py-2 text-black bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all duration-200",
                  confirmPasswordFocused || confirmPassword ? "border-[#7D1A1D]" : "border-gray-300",
                  passwordError ? "border-red-500" : "",
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
              {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#7D1A1D] hover:bg-[#6a1518] text-white py-3 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password...
                </span>
              ) : (
                <span className="text-lg font-medium">Set New Password</span>
              )}
            </Button>

            {/* Helper text */}
            <p className="text-xs text-gray-600 text-center font-serif">
              Your password must be at least 6 characters long
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
