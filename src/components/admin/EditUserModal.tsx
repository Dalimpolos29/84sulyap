'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: any
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [suffix, setSuffix] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Alumni')
  const [accountStatus, setAccountStatus] = useState('Active')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [firstNameFocused, setFirstNameFocused] = useState(false)
  const [middleNameFocused, setMiddleNameFocused] = useState(false)
  const [lastNameFocused, setLastNameFocused] = useState(false)
  const [suffixFocused, setSuffixFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)

  const supabase = createClient()

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.first_name || '')
      setMiddleName(user.middle_name || '')
      setLastName(user.last_name || '')
      setSuffix(user.suffix || '')
      setEmail(user.email || '')
      setRole(user.role || 'Alumni')
      setAccountStatus(user.account_status || 'Active')
      setError('')
      setSuccess('')
    }
  }, [isOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate required fields
    if (!firstName || !lastName) {
      setError('First name and last name are required')
      return
    }

    // Email is optional but validate format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // Update profile using direct update (admin has permission)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          middle_name: middleName || null,
          last_name: lastName,
          suffix: suffix || null,
          email: email || null,
          role: role,
          account_status: accountStatus
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      setSuccess('User updated successfully!')

      // Reset form after 2 seconds and close
      setTimeout(() => {
        setSuccess('')
        onSuccess()
        onClose()
      }, 1500)
    } catch (error: any) {
      console.error('User update error:', error)
      setError(error.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#7D1A1D] text-white py-4 px-6 flex items-center justify-between sticky top-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif">Edit User</h2>
            <p className="text-sm font-serif opacity-90">Update user information</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error/Success messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                {success}
              </div>
            )}

            {/* Username (read-only) */}
            <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded">
              <p className="text-sm text-gray-600 font-serif">Username</p>
              <p className="font-medium text-gray-900">{user?.username}</p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-12 gap-3">
              {/* First Name */}
              <div className="relative col-span-6">
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                  className={cn(
                    "block w-full px-3 py-2 text-black bg-white border rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all",
                    firstNameFocused || firstName ? "border-[#7D1A1D]" : "border-gray-300"
                  )}
                  required
                />
                <label
                  htmlFor="firstName"
                  className={cn(
                    "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm",
                    firstNameFocused || firstName
                      ? "transform -translate-y-[1.1rem] scale-[0.75] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                      : "top-2.5"
                  )}
                >
                  First Name *
                </label>
              </div>

              {/* Middle Name */}
              <div className="relative col-span-6">
                <input
                  id="middleName"
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  onFocus={() => setMiddleNameFocused(true)}
                  onBlur={() => setMiddleNameFocused(false)}
                  className={cn(
                    "block w-full px-3 py-2 text-black bg-white border rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all",
                    middleNameFocused || middleName ? "border-[#7D1A1D]" : "border-gray-300"
                  )}
                />
                <label
                  htmlFor="middleName"
                  className={cn(
                    "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm",
                    middleNameFocused || middleName
                      ? "transform -translate-y-[1.1rem] scale-[0.75] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                      : "top-2.5"
                  )}
                >
                  Middle Name
                </label>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              {/* Last Name */}
              <div className="relative col-span-9">
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                  className={cn(
                    "block w-full px-3 py-2 text-black bg-white border rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all",
                    lastNameFocused || lastName ? "border-[#7D1A1D]" : "border-gray-300"
                  )}
                  required
                />
                <label
                  htmlFor="lastName"
                  className={cn(
                    "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm",
                    lastNameFocused || lastName
                      ? "transform -translate-y-[1.1rem] scale-[0.75] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                      : "top-2.5"
                  )}
                >
                  Last Name *
                </label>
              </div>

              {/* Suffix */}
              <div className="relative col-span-3">
                <input
                  id="suffix"
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  onFocus={() => setSuffixFocused(true)}
                  onBlur={() => setSuffixFocused(false)}
                  className={cn(
                    "block w-full px-3 py-2 text-black bg-white border rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all",
                    suffixFocused || suffix ? "border-[#7D1A1D]" : "border-gray-300"
                  )}
                />
                <label
                  htmlFor="suffix"
                  className={cn(
                    "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm",
                    suffixFocused || suffix
                      ? "transform -translate-y-[1.1rem] scale-[0.75] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                      : "top-2.5"
                  )}
                >
                  Suffix
                </label>
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className={cn(
                  "block w-full px-3 py-2 text-black bg-white border rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all",
                  emailFocused || email ? "border-[#7D1A1D]" : "border-gray-300"
                )}
              />
              <label
                htmlFor="email"
                className={cn(
                  "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 font-serif text-sm",
                  emailFocused || email
                    ? "transform -translate-y-[1.1rem] scale-[0.75] text-[#7D1A1D] bg-white px-1 top-2 origin-[0]"
                    : "top-2.5"
                )}
              >
                Email (optional)
              </label>
            </div>

            {/* Role Dropdown */}
            <div className="relative">
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all font-serif"
                required
              >
                <option value="Alumni">Alumni</option>
                <option value="Officer">Officer</option>
                {user?.role === 'Super Admin' && (
                  <option value="Super Admin">Super Admin</option>
                )}
              </select>
            </div>

            {/* Account Status Dropdown */}
            <div className="relative">
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Account Status
              </label>
              <select
                id="accountStatus"
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value)}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] transition-all font-serif"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#7D1A1D] hover:bg-[#6a1518] text-white py-3 rounded transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating User...
                </span>
              ) : (
                <span className="text-lg font-medium">Update User</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
