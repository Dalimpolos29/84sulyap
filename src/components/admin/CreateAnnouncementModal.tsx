'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import ImageUpload from '@/components/common/ImageUpload'

interface CreateAnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateAnnouncementModal({ isOpen, onClose, onSuccess }: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high'>('normal')
  const [pinned, setPinned] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [attachments, setAttachments] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title || !content) {
      setError('Title and content are required')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Parse attachments (comma-separated URLs)
      const attachmentsArray = attachments
        ? attachments.split(',').map(url => url.trim()).filter(url => url)
        : null

      const { error: insertError } = await supabase
        .from('announcements')
        .insert({
          title,
          content,
          priority,
          pinned,
          image_url: imageUrl || null,
          expires_at: expiresAt || null,
          cta_text: ctaText || null,
          cta_link: ctaLink || null,
          attachments: attachmentsArray,
          created_by: user.id
        })

      if (insertError) throw insertError

      setSuccess('Announcement created successfully!')

      setTimeout(() => {
        setTitle('')
        setContent('')
        setPriority('normal')
        setPinned(false)
        setImageUrl('')
        setExpiresAt('')
        setCtaText('')
        setCtaLink('')
        setAttachments('')
        setSuccess('')
        onSuccess()
        onClose()
      }, 1500)
    } catch (error: any) {
      console.error('Create announcement error:', error)
      setError(error.message || 'Failed to create announcement')
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
            <h2 className="text-xl md:text-2xl font-bold font-serif">Create Announcement</h2>
            <p className="text-sm font-serif opacity-90">Post a new announcement for all members</p>
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

            {/* Title */}
            <div>
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] resize-none"
                required
              />
            </div>

            {/* Image Upload */}
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              bucket="announcement-images"
              label="Cover Image (optional)"
            />

            {/* Expiration Date */}
            <div>
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Expiration Date (optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
              />
              <p className="text-xs text-gray-500 mt-1">Announcement will auto-archive after this date</p>
            </div>

            {/* Call to Action */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 font-serif mb-1">
                  CTA Button Text (optional)
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g., Register Now"
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-serif mb-1">
                  CTA Link (optional)
                </label>
                <input
                  type="url"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="https://..."
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Attachments (optional)
              </label>
              <input
                type="text"
                value={attachments}
                onChange={(e) => setAttachments(e.target.value)}
                placeholder="https://file1.pdf, https://file2.pdf"
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated file URLs</p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'high')}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
              >
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Pinned */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 text-[#7D1A1D] focus:ring-[#7D1A1D] border-gray-300 rounded"
              />
              <label htmlFor="pinned" className="text-sm text-gray-700 font-serif">
                Pin to top
              </label>
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
                  Creating...
                </span>
              ) : (
                <span className="text-lg font-medium">Create Announcement</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
