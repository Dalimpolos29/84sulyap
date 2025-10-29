'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Plus, Pencil, Trash2, Pin } from 'lucide-react'
import CreateAnnouncementModal from './CreateAnnouncementModal'
import EditAnnouncementModal from './EditAnnouncementModal'

export default function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, profiles!announcements_created_by_fkey(first_name, last_name)')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (announcement: any) => {
    if (!confirm(`Delete announcement "${announcement.title}"?`)) {
      return
    }

    setDeleting(announcement.id)

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id)

      if (error) throw error

      loadAnnouncements()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert('Error: ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleTogglePin = async (announcement: any) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ pinned: !announcement.pinned })
        .eq('id', announcement.id)

      if (error) throw error

      loadAnnouncements()
    } catch (error: any) {
      console.error('Toggle pin error:', error)
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#7D1A1D]" />
      </div>
    )
  }

  return (
    <>
      {/* Add Announcement Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#7D1A1D] text-white px-4 py-2 rounded hover:bg-[#6a1518] transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Create Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="bg-white rounded shadow-sm p-12 text-center">
            <p className="text-gray-500 font-serif">No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded shadow-sm p-4 border-l-4"
              style={{
                borderLeftColor: announcement.priority === 'high' ? '#7D1A1D' : '#d1d5db'
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.pinned && (
                      <Pin className="h-4 w-4 text-[#7D1A1D]" />
                    )}
                    <h3 className="font-bold text-lg text-gray-900 font-serif">
                      {announcement.title}
                    </h3>
                    {announcement.priority === 'high' && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded font-medium">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mb-3">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      By {announcement.profiles?.first_name} {announcement.profiles?.last_name}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(announcement)}
                    className={`p-2 rounded transition-colors ${
                      announcement.pinned
                        ? 'bg-[#7D1A1D] text-white hover:bg-[#6a1518]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={announcement.pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnnouncement(announcement)
                      setShowEditModal(true)
                    }}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement)}
                    disabled={deleting === announcement.id}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {deleting === announcement.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateAnnouncementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadAnnouncements()
        }}
      />

      <EditAnnouncementModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedAnnouncement(null)
        }}
        onSuccess={() => {
          loadAnnouncements()
        }}
        announcement={selectedAnnouncement}
      />
    </>
  )
}
