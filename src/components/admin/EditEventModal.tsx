'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import ImageUpload from '@/components/common/ImageUpload'

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  event: any
}

export default function EditEventModal({ isOpen, onClose, onSuccess, event }: EditEventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [location, setLocation] = useState('')
  const [maxAttendees, setMaxAttendees] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [cost, setCost] = useState('Free')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '')
      setDescription(event.description || '')
      setEventDate(event.event_date || '')
      setEventTime(event.event_time || '')
      setLocation(event.location || '')
      setMaxAttendees(event.max_attendees?.toString() || '')
      setImageUrl(event.image_url || '')
      setRegistrationDeadline(event.registration_deadline || '')
      setCost(event.cost || 'Free')
      setError('')
      setSuccess('')
    }
  }, [isOpen, event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title || !description || !eventDate || !location) {
      setError('Title, description, date, and location are required')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title,
          description,
          event_date: eventDate,
          event_time: eventTime || null,
          location,
          max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
          image_url: imageUrl || null,
          registration_deadline: registrationDeadline || null,
          cost: cost || 'Free',
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id)

      if (updateError) throw updateError

      setSuccess('Event updated successfully!')

      setTimeout(() => {
        setSuccess('')
        onSuccess()
        onClose()
      }, 1500)
    } catch (error: any) {
      console.error('Update event error:', error)
      setError(error.message || 'Failed to update event')
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
            <h2 className="text-xl md:text-2xl font-bold font-serif">Edit Event</h2>
            <p className="text-sm font-serif opacity-90">Update event details</p>
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
                Event Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D] resize-none"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 font-serif mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-serif mb-1">
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., UP Integrated School Auditorium"
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                required
              />
            </div>

            {/* Cover Image */}
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              bucket="event-images"
              label="Cover Image (optional)"
            />

            {/* Registration Deadline and Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 font-serif mb-1">
                  Registration Deadline (optional)
                </label>
                <input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 font-serif mb-1">
                  Cost
                </label>
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Free or ₱500"
                  className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
                />
              </div>
            </div>

            {/* Max Attendees */}
            <div>
              <label className="block text-sm text-gray-600 font-serif mb-1">
                Max Attendees (optional)
              </label>
              <input
                type="number"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                min="1"
                placeholder="Leave empty for unlimited"
                className="block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
              />
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
                  Updating...
                </span>
              ) : (
                <span className="text-lg font-medium">Update Event</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
