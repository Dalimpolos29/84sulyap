'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Upload, Trash2, CheckCircle, AlertCircle, BookOpen } from 'lucide-react'

interface YearbookPage {
  id: string
  page_number: number
  cloudinary_url: string
  cloudinary_public_id: string
}

export default function YearbookUpload() {
  const [pages, setPages] = useState<YearbookPage[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [uploadedCount, setUploadedCount] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('yearbook_pages')
        .select('*')
        .order('page_number', { ascending: true })

      if (error) throw error
      setPages(data || [])
      setUploadedCount(data?.length || 0)
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file' })
      return
    }

    if (pageNumber < 1 || pageNumber > 98) {
      setMessage({ type: 'error', text: 'Page number must be between 1 and 98' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('pageNumber', pageNumber.toString())

      const response = await fetch('/api/admin/upload-yearbook', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setMessage({ type: 'success', text: `Page ${pageNumber} uploaded successfully!` })
      setSelectedFile(null)
      setPageNumber(prev => Math.min(prev + 1, 98))

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Refresh pages list
      fetchPages()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload' })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (pageNum: number) => {
    if (!confirm(`Are you sure you want to delete page ${pageNum}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/upload-yearbook?pageNumber=${pageNum}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      setMessage({ type: 'success', text: `Page ${pageNum} deleted successfully` })
      fetchPages()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete' })
    }
  }

  const findNextMissingPage = () => {
    const uploadedPageNumbers = pages.map(p => p.page_number)
    for (let i = 1; i <= 98; i++) {
      if (!uploadedPageNumbers.includes(i)) {
        return i
      }
    }
    return 98
  }

  const jumpToNextMissing = () => {
    const nextMissing = findNextMissingPage()
    setPageNumber(nextMissing)
  }

  const progress = Math.round((uploadedCount / 98) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-[#7D1A1D]" />
          <h2 className="text-2xl font-bold text-gray-900">Digital Sulyap Upload</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-2xl font-bold text-[#7D1A1D]">{uploadedCount} / 98</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#7D1A1D] to-[#C9A335] h-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Upload New Page</h3>

        <div className="space-y-4">
          {/* Page Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Number (1-98)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="98"
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7D1A1D]"
              />
              <button
                onClick={jumpToNextMissing}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Jump to Next Missing
              </button>
            </div>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image File
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-[#7D1A1D] file:text-white
                hover:file:bg-[#661518]
                file:cursor-pointer cursor-pointer"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-[#7D1A1D] hover:bg-[#661518] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Page {pageNumber}
              </>
            )}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}
      </div>

      {/* Uploaded Pages Grid */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Uploaded Pages</h3>

        {pages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pages uploaded yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[8.5/11] relative bg-gray-100">
                  <img
                    src={page.cloudinary_url}
                    alt={`Page ${page.page_number}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(page.page_number)}
                      className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all"
                      title="Delete page"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-2 text-center bg-white">
                  <p className="text-sm font-semibold text-gray-700">Page {page.page_number}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
