'use client'

import { useState } from 'react'
import { Loader2, Upload, Link as LinkIcon } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  bucket: 'event-images' | 'announcement-images'
  label?: string
  required?: boolean
}

export default function ImageUpload({ value, onChange, bucket, label = 'Cover Image', required = false }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'link'>('upload')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [linkInput, setLinkInput] = useState(value)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onChange(data.url)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleLinkSubmit = () => {
    if (linkInput) {
      onChange(linkInput)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm text-gray-600 font-serif">
          {label} {required && '*'}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'upload'
                ? 'bg-[#7D1A1D] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Upload className="h-3 w-3 inline mr-1" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'link'
                ? 'bg-[#7D1A1D] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <LinkIcon className="h-3 w-3 inline mr-1" />
            Link
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}

      {mode === 'upload' ? (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#7D1A1D] file:text-white hover:file:bg-[#6a1518] file:cursor-pointer disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">Max 5MB. Recommended: 1200x630px</p>
          {uploading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onBlur={handleLinkSubmit}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 text-sm text-black bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#7D1A1D]"
          />
          <button
            type="button"
            onClick={handleLinkSubmit}
            className="px-4 py-2 bg-[#7D1A1D] text-white text-sm rounded hover:bg-[#6a1518] transition-colors"
          >
            Set
          </button>
        </div>
      )}

      {value && (
        <div className="mt-3">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded border border-gray-300"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-red-600 hover:underline mt-1"
          >
            Remove image
          </button>
        </div>
      )}
    </div>
  )
}
