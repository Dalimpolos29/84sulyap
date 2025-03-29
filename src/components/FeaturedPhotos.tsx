'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

// Define types
type FeaturedPhoto = {
  file: File
  preview: string
  caption: string
}

type FeaturedPhotosData = {
  id: string
  user_id: string
  f1_url: string | null
  f1_caption: string | null
  f2_url: string | null
  f2_caption: string | null
  f3_url: string | null
  f3_caption: string | null
  created_at: string
  updated_at: string
}

type FeaturedPhotosProps = {
  userId: string
  userFolderName: string
  isOwnProfile: boolean
  onComplete?: () => void
}

export default function FeaturedPhotos({ userId, userFolderName, isOwnProfile, onComplete }: FeaturedPhotosProps) {
  // Fetch state
  const [featuredPhotos, setFeaturedPhotos] = useState<FeaturedPhotosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<FeaturedPhoto[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(-1)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // View state
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  
  // Fetch featured photos on load
  useEffect(() => {
    const fetchFeaturedPhotos = async () => {
      try {
        setLoading(true)
        setFetchError(null)
        
        const { data, error } = await supabase
          .from('feature_photos')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (error) {
          // No photos found is not an error for our purposes
          if (error.code === 'PGRST116') {
            setFeaturedPhotos(null)
          } else {
            console.error('Error fetching featured photos:', error)
            setFetchError(error.message)
          }
        } else {
          setFeaturedPhotos(data as FeaturedPhotosData)
        }
      } catch (err: any) {
        console.error('Error in featured photos fetch:', err)
        setFetchError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      fetchFeaturedPhotos()
    }
  }, [userId, supabase])
  
  // Transform data into an array of photos for easier rendering
  const existingPhotos = featuredPhotos ? [
    { url: featuredPhotos.f1_url, caption: featuredPhotos.f1_caption },
    { url: featuredPhotos.f2_url, caption: featuredPhotos.f2_caption },
    { url: featuredPhotos.f3_url, caption: featuredPhotos.f3_caption }
  ].filter(photo => photo.url) : []
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    // Convert FileList to array and limit to 3 photos
    const fileArray = Array.from(files).slice(0, 3)
    
    // Create preview URLs and initialize captions
    const newPhotos = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: ''
    }))
    
    setSelectedPhotos(newPhotos)
    setIsEditing(true)
    // Start with the first photo
    setCurrentPhotoIndex(0)
  }
  
  // Update caption for current photo
  const updateCaption = (caption: string) => {
    if (currentPhotoIndex >= 0) {
      const updatedPhotos = [...selectedPhotos]
      updatedPhotos[currentPhotoIndex].caption = caption
      setSelectedPhotos(updatedPhotos)
    }
  }
  
  // Confirm current photo and move to next
  const confirmCurrentPhoto = () => {
    // If there are more photos to confirm
    if (currentPhotoIndex < selectedPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    } else {
      // All photos confirmed, show final confirmation screen
      setCurrentPhotoIndex(-2) // -2 indicates all photos confirmed
    }
  }
  
  // Upload all confirmed photos
  const uploadAllPhotos = async () => {
    if (selectedPhotos.length === 0) return
    
    setIsUploading(true)
    setUploadError(null)
    
    try {
      // URLs to store in the database
      const photoUrls: Record<string, string> = {}
      const photoCaptions: Record<string, string | null> = {}
      
      // Upload each photo to storage
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i]
        const fileName = `${Date.now()}_${i}.jpeg`
        const filePath = `${userFolderName}/featured/${fileName}`
        
        // Upload the file
        const { data, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, photo.file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (uploadError) throw uploadError
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath)
        
        // Store URL and caption
        const fieldIndex = i + 1
        photoUrls[`f${fieldIndex}_url`] = publicUrl
        photoCaptions[`f${fieldIndex}_caption`] = photo.caption || null
      }
      
      // Check if user already has a featured photos record
      const { data: existingRecord } = await supabase
        .from('feature_photos')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      
      // Insert or update the database record
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('feature_photos')
          .update({
            ...photoUrls,
            ...photoCaptions
          })
          .eq('user_id', userId)
        
        if (updateError) throw updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('feature_photos')
          .insert({
            user_id: userId,
            ...photoUrls,
            ...photoCaptions
          })
        
        if (insertError) throw insertError
      }
      
      // Success
      setUploadComplete(true)
      // Clean up preview URLs
      selectedPhotos.forEach(photo => URL.revokeObjectURL(photo.preview))
      
      // Refresh data after brief delay
      setTimeout(() => {
        // Fetch updated photos
        const fetchUpdatedPhotos = async () => {
          const { data } = await supabase
            .from('feature_photos')
            .select('*')
            .eq('user_id', userId)
            .single()
          
          setFeaturedPhotos(data as FeaturedPhotosData)
        }
        
        fetchUpdatedPhotos()
        
        // Reset state
        setSelectedPhotos([])
        setCurrentPhotoIndex(-1)
        setIsEditing(false)
        setUploadComplete(false)
        if (onComplete) onComplete()
      }, 2000)
      
    } catch (err: any) {
      console.error('Error uploading photos:', err)
      setUploadError(err.message || 'Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }
  
  // Trigger file selection dialog
  const handleAddPhotosClick = () => {
    fileInputRef.current?.click()
  }
  
  // Cancel and reset
  const handleCancel = () => {
    // Clean up preview URLs
    selectedPhotos.forEach(photo => URL.revokeObjectURL(photo.preview))
    setSelectedPhotos([])
    setCurrentPhotoIndex(-1)
    setIsEditing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  
  // Handle back button in confirmation view
  const handleBackToEdit = () => {
    // Go back to editing the last photo
    setCurrentPhotoIndex(selectedPhotos.length - 1)
  }
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedPhotos.forEach(photo => URL.revokeObjectURL(photo.preview))
    }
  }, [])
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#7D1A1D]/90 text-white py-3 px-6">
          <h2 className="text-xl font-serif font-bold">Featured Photos</h2>
        </div>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7D1A1D]"></div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (fetchError) {
    return (
      <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#7D1A1D]/90 text-white py-3 px-6">
          <h2 className="text-xl font-serif font-bold">Featured Photos</h2>
        </div>
        <div className="p-6 text-red-600">
          <p>Error loading featured photos.</p>
        </div>
      </div>
    )
  }
  
  // Editing: showing individual photos for captioning
  if (isEditing && currentPhotoIndex >= 0) {
    const currentPhoto = selectedPhotos[currentPhotoIndex]
    
    return (
      <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#7D1A1D]/90 text-white py-3 px-6 flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold">Featured Photo {currentPhotoIndex + 1}/{selectedPhotos.length}</h2>
          <button 
            onClick={handleCancel}
            className="text-white/90 hover:text-white text-sm"
          >
            Cancel
          </button>
        </div>
        
        <div className="p-6">
          <div className="w-full max-w-lg mx-auto mb-6">
            <div 
              className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-md mb-4"
              style={{ 
                backgroundImage: `url(${currentPhoto.preview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            <div className="w-full">
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                Caption (optional)
              </label>
              <input
                type="text"
                id="caption"
                value={currentPhoto.caption}
                onChange={(e) => updateCaption(e.target.value)}
                placeholder="Add a caption to this photo..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#7D1A1D] focus:ring focus:ring-[#7D1A1D]/20 transition"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={confirmCurrentPhoto}
              className="bg-[#7D1A1D] hover:bg-[#7D1A1D]/90 text-white py-2 px-6 rounded-md font-serif"
            >
              {currentPhotoIndex < selectedPhotos.length - 1 ? 'Confirm & Next' : 'Confirm Photo'}
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // Editing: final confirmation screen showing all photos
  if (isEditing && currentPhotoIndex === -2) {
    return (
      <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#7D1A1D]/90 text-white py-3 px-6 flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold">Featured Photos Preview</h2>
          <button 
            onClick={handleCancel}
            className="text-white/90 hover:text-white text-sm"
          >
            Cancel
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">Review your selected photos before uploading:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {selectedPhotos.map((photo, index) => (
              <div key={index} className="aspect-square relative">
                <div 
                  className="w-full h-full rounded-lg overflow-hidden bg-gray-100 shadow-md"
                  style={{ 
                    backgroundImage: `url(${photo.preview})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
              {uploadError}
            </div>
          )}
          
          {uploadComplete && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4">
              Photos uploaded successfully!
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={handleBackToEdit}
              className="text-[#7D1A1D] hover:text-[#7D1A1D]/80 py-2 px-4 rounded-md font-serif"
              disabled={isUploading}
            >
              Back to Edit
            </button>
            
            <button
              onClick={uploadAllPhotos}
              className="bg-[#7D1A1D] hover:bg-[#7D1A1D]/90 text-white py-2 px-6 rounded-md font-serif flex items-center"
              disabled={isUploading || uploadComplete}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Apply to Profile'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // Viewing state (default) - show gallery or placeholders
  return (
    <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
      <div className="bg-[#7D1A1D]/90 text-white py-3 px-6 flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold">Featured Photos</h2>
        
        {isOwnProfile && (
          <button 
            onClick={handleAddPhotosClick}
            className="text-white hover:text-white/90 text-sm bg-[#7D1A1D]/80 hover:bg-[#7D1A1D] px-3 py-1 rounded-md"
          >
            {existingPhotos.length > 0 ? 'Change Photos' : 'Add Photos'}
          </button>
        )}
      </div>
      
      <div className="p-6">
        {/* If there are photos, display them */}
        {existingPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {existingPhotos.map((photo, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="aspect-square w-full relative rounded-xl overflow-hidden bg-gray-100 shadow-md">
                  <Image
                    src={photo.url as string}
                    alt={photo.caption || `Featured photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                {photo.caption && (
                  <div className="mt-2 text-center">
                    <p className="text-[#7D1A1D] font-medium">- {photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Fill in placeholder cards if less than 3 photos */}
            {Array.from({ length: 3 - existingPhotos.length }).map((_, index) => (
              <div key={`placeholder-${index}`} className="flex flex-col items-center">
                <div className="aspect-square w-full rounded-xl bg-gray-100 flex items-center justify-center shadow-sm border border-gray-200">
                  <svg 
                    className="w-10 h-10 text-gray-300" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No photos yet, show placeholders */
          <>
            <p className="text-gray-600 text-center mb-6">
              {isOwnProfile 
                ? "Showcase up to 3 photos in your profile. Add photos to get started."
                : "This user hasn't added any featured photos yet."}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center shadow-sm border border-gray-200"
                >
                  <svg 
                    className="w-10 h-10 text-gray-300" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ))}
            </div>
            
            {isOwnProfile && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleAddPhotosClick}
                  className="bg-[#7D1A1D] hover:bg-[#7D1A1D]/90 text-white py-2 px-6 rounded-md font-serif flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Featured Photos
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        accept="image/*" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
      />
    </div>
  )
} 