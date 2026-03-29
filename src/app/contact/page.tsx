'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSubmitted(true)
      setIsSubmitting(false)

      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          name: '',
          email: '',
          category: 'General',
          message: ''
        })
      }, 5000)
    } catch (err: any) {
      console.error('Contact form error:', err)
      setError(err.message || 'Failed to send message. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 font-serif text-[#7D1A1D]">
      <div className="max-w-3xl w-full">
        {/* Logo */}
        <div className="text-center mb-0 relative z-10">
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#C9A335]"></div>
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
          <div className="p-8 md:p-12">
          {submitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-[#0B5A28] mb-2">
                Message Sent Successfully!
              </h2>
              <p className="text-gray-600">
                We'll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B5A28] focus:border-transparent"
                  placeholder="Juan Dela Cruz"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B5A28] focus:border-transparent"
                  placeholder="juan@example.com"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B5A28] focus:border-transparent"
                >
                  <option value="General">General Inquiry</option>
                  <option value="Technical">Technical Support</option>
                  <option value="Membership">Membership</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B5A28] focus:border-transparent resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0B5A28] hover:bg-[#094821] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-600 text-sm text-center">
                Already a member?{' '}
                <Link href="/login" className="text-[#0B5A28] hover:text-[#094821] font-semibold">
                  Login here
                </Link>
              </p>
              <p className="text-gray-600 text-sm text-center mt-2">
                <Link href="/about" className="text-[#7D1A1D] hover:text-[#661518] font-semibold">
                  Learn more about us
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; 2025 UPIS Batch '84. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
