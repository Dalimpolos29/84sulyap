'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ProgressLoader from '@/components/ui/ProgressLoader'

// Define types
type FeaturedPhoto = {
  file: File
  preview: string
  caption: string
}

type ExistingPhoto = {
  url: string | null
  caption: string | null
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  
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
  const existingPhotos: ExistingPhoto[] = featuredPhotos ? [
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
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Initialize all fields as null first
      const photoUrls: Record<string, string | null> = {
        f1_url: null,
        f2_url: null,
        f3_url: null
      };
      const photoCaptions: Record<string, string | null> = {
        f1_caption: null,
        f2_caption: null,
        f3_caption: null
      };
      
      // Prepare optimistic update data with all fields nulled first
      const optimisticPhotos: FeaturedPhotosData = {
        ...(featuredPhotos || {
          id: '',
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }),
        f1_url: null,
        f1_caption: null,
        f2_url: null,
        f2_caption: null,
        f3_url: null,
        f3_caption: null,
        updated_at: new Date().toISOString()
      };
      
      // If there are selected photos, process them
      if (selectedPhotos.length > 0) {
        // Process each photo
      for (let i = 0; i < selectedPhotos.length; i++) {
          const photo = selectedPhotos[i];
          const fieldIndex = i + 1;
          
          // Skip if it's an existing photo URL (not a new file)
          if (photo.preview.startsWith('http')) {
            photoUrls[`f${fieldIndex}_url`] = photo.preview;
            photoCaptions[`f${fieldIndex}_caption`] = photo.caption || null;
            // Update optimistic data
            (optimisticPhotos as any)[`f${fieldIndex}_url`] = photo.preview;
            (optimisticPhotos as any)[`f${fieldIndex}_caption`] = photo.caption || null;
            continue;
          }
          
          // Only upload if it's a real file (not a placeholder)
          if (photo.file.size > 0) {
            const fileName = `${Date.now()}_${i}.jpeg`;
            const filePath = `${userFolderName}/featured/${fileName}`;
        
        // Upload the file
        const { data, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, photo.file, {
            cacheControl: '3600',
            upsert: false
              });
        
            if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
              .getPublicUrl(filePath);
        
        // Store URL and caption
            photoUrls[`f${fieldIndex}_url`] = publicUrl;
            photoCaptions[`f${fieldIndex}_caption`] = photo.caption || null;
            // Update optimistic data
            (optimisticPhotos as any)[`f${fieldIndex}_url`] = publicUrl;
            (optimisticPhotos as any)[`f${fieldIndex}_caption`] = photo.caption || null;
          }
        }
      }

      // Apply optimistic update immediately
      setFeaturedPhotos(optimisticPhotos);
      setIsEditing(false);
      setSelectedPhotos([]);
      
      // Check if user already has a featured photos record
      const { data: existingRecord } = await supabase
        .from('feature_photos')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('feature_photos')
          .update({
            ...photoUrls,
            ...photoCaptions,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('feature_photos')
          .insert({
            user_id: userId,
            ...photoUrls,
            ...photoCaptions
          });
        
        if (insertError) throw insertError;
      }
      
      // Success - clean up preview URLs
      selectedPhotos.forEach(photo => {
        if (!photo.preview.startsWith('http')) {
          URL.revokeObjectURL(photo.preview);
        }
      });
      
      setUploadComplete(true);
      
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      setUploadError(err.message || 'Failed to upload photos');
      
      // On error, fetch the latest data to ensure consistency
          const { data } = await supabase
            .from('feature_photos')
            .select('*')
            .eq('user_id', userId)
        .single();
      
      setFeaturedPhotos(data as FeaturedPhotosData);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadComplete(false);
      }, 2000);
    }
  };
  
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
  
  // Handle edit button click
  const handleEditClick = () => {
    // Convert existing photos to selected photos format immediately
    const initialSelectedPhotos = existingPhotos
      .filter(photo => photo.url) // Only include photos with URLs
      .map(photo => ({
        file: new File([], photo.url || '', { type: 'image/jpeg' }),
        preview: photo.url || '',
        caption: photo.caption || ''
      }));
    setSelectedPhotos(initialSelectedPhotos);
    setIsEditing(true);
  }
  
  // Handle individual photo deletion
  const handleDeletePhoto = (index: number) => {
    const newPhotos = [...selectedPhotos]
    newPhotos.splice(index, 1)
    setSelectedPhotos(newPhotos)
  }

  // Handle adding a new photo at specific index
  const handleAddPhotoAt = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newPhoto = {
          file,
          preview: URL.createObjectURL(file),
          caption: ''
        };
        
        // Create a fixed-size array of 3 slots
        const newPhotos: (FeaturedPhoto | null)[] = Array(3).fill(null);
        
        // Copy existing photos to their current positions
        if (isEditing) {
          selectedPhotos.forEach((photo, i) => {
            newPhotos[i] = photo;
          });
        } else if (existingPhotos.length > 0) {
          existingPhotos.forEach((photo, i) => {
            if (photo.url) {
              newPhotos[i] = {
                file: new File([], photo.url, { type: 'image/jpeg' }),
                preview: photo.url,
                caption: photo.caption || ''
              };
            }
          });
        }

        // Add the new photo at the exact clicked index
        newPhotos[index] = newPhoto;
        
        // Filter out null values but preserve positions
        const cleanedPhotos = newPhotos.filter((photo): photo is FeaturedPhoto => photo !== null);
        
        setSelectedPhotos(cleanedPhotos);
        setIsEditing(true);
      }
    };
    input.click();
  };
  
  // Handle individual photo replacement
  const handleReplacePhoto = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newPhoto = {
          file,
          preview: URL.createObjectURL(file),
          caption: selectedPhotos[index]?.caption || ''
        };
        
        // Create a new array with all current photos
        const newPhotos = [...selectedPhotos];
        // Replace the photo at the specified index
        newPhotos[index] = newPhoto;
        // Update the state with all photos
        setSelectedPhotos(newPhotos);
      }
    };
    input.click();
  };
  
  // Prepare slides for lightbox
  const slides = existingPhotos.map(photo => ({
    src: photo.url as string,
    alt: photo.caption || undefined,
    title: photo.caption || undefined
  }));
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-transparent border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-transparent border-b border-gray-200 py-3 px-6">
          <h2 className="text-xl font-bold text-[#7D1A1D]">Featured Photos</h2>
        </div>
        <div className="relative">
          <ProgressLoader duration={1500} />
          <div className="p-6 flex justify-center items-center h-64">
            <div className="text-[#7D1A1D] text-sm">Loading photos...</div>
          </div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (fetchError) {
    return (
      <div className="bg-transparent border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-transparent border-b border-gray-200 py-3 px-6">
          <h2 className="text-xl font-bold text-[#7D1A1D]">Featured Photos</h2>
        </div>
        <div className="p-6 text-red-600">
          <p>Error loading featured photos.</p>
        </div>
      </div>
    )
  }

  // Edit mode - show photos with captions
  if (isEditing) {
    const photos = selectedPhotos;
    const emptySlots = 3 - photos.length;

    return (
      <div className="bg-transparent border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-transparent border-b border-gray-200 py-3 px-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#7D1A1D]">Featured Photos</h2>
          <button 
            onClick={handleCancel}
            className="text-red-500 hover:text-red-600 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            {/* Selected photos */}
            {photos.map((photo, index) => (
              <div key={index} className="flex flex-col">
                <div className="relative w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-200 transition-all group" style={{ paddingBottom: '125%' }}>
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      backgroundImage: `url(${photo.preview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  
                  {/* Overlay with controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplacePhoto(index);
                      }}
                      className="p-2 rounded-full bg-white/90 hover:bg-white transition-all transform hover:scale-110 shadow-lg"
                      title="Replace photo"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(index);
                      }}
                      className="p-2 rounded-full bg-white/90 hover:bg-white transition-all transform hover:scale-110 shadow-lg"
                      title="Delete photo"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-1 sm:mt-2">
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => {
                      const updatedPhotos = [...selectedPhotos];
                      updatedPhotos[index].caption = e.target.value;
                      setSelectedPhotos(updatedPhotos);
                    }}
                    placeholder="Add a caption..."
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:border-[#7D1A1D] focus:ring focus:ring-[#7D1A1D]/20 transition text-sm p-2"
                  />
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: emptySlots }).map((_, i) => {
              const actualIndex = selectedPhotos.length + i;
              return (
                <div key={`empty-${i}`} className="flex flex-col">
                  <button
                    onClick={() => handleAddPhotoAt(actualIndex)}
                    className="relative w-full rounded-lg border border-dashed border-gray-300 hover:border-[#C9A335] transition-all flex flex-col items-center justify-center group hover:shadow-lg hover:-translate-y-0.5"
                    style={{ paddingBottom: '125%' }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-[#C9A335]/10 transition-colors">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C9A335]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-500 group-hover:text-[#C9A335]">Add photo</span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={uploadAllPhotos}
              className="text-[#C9A335] hover:text-[#E5BD4F] transition-colors text-xs"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#C9A335]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          
          {uploadError && (
            <div className="mt-4 bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-md">
              {uploadError}
            </div>
          )}
          
          {uploadComplete && (
            <div className="mt-4 bg-green-50 border border-green-300 text-green-600 px-4 py-3 rounded-md">
              Photos updated successfully!
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default view mode - show gallery or placeholders
  return (
    <div className="bg-transparent rounded-xl overflow-hidden">
      <div className="bg-transparent border-b border-gray-200 py-3 px-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#7D1A1D]">Featured Photos</h2>
        
        {isOwnProfile && existingPhotos.length > 0 && (
          <button 
            onClick={handleEditClick}
            className="flex items-center gap-1 text-[#C9A335] hover:text-[#E5BD4F] transition-colors"
            aria-label="Edit featured photos"
          >
            <span className="text-xs">Edit Photos</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="pt-2 pb-4 px-6">
        {/* If there are photos, display them */}
        {existingPhotos.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            {existingPhotos.map((photo, index) => (
                <div key={index} className="flex flex-col group">
                  <div 
                    className="relative w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-200 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" 
                    style={{ paddingBottom: '125%' }}
                    onClick={() => {
                      setActivePhotoIndex(index);
                      setIsLightboxOpen(true);
                    }}
                  >
                  <Image
                    src={photo.url as string}
                    alt={photo.caption || `Featured photo ${index + 1}`}
                    fill
                    className="object-cover"
                      sizes="(max-width: 768px) 33vw, 33vw"
                  />
                </div>
                {photo.caption && (
                    <div className="mt-1 sm:mt-2 text-center relative group">
                      <p className="text-gray-600 text-xs sm:text-sm truncate group-hover:invisible">{photo.caption}</p>
                      <div className="absolute inset-x-0 top-0 hidden group-hover:block z-20">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap mx-auto inline-block">
                          {photo.caption}
                        </div>
                      </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Fill in placeholder cards if less than 3 photos */}
              {Array.from({ length: 3 - existingPhotos.length }).map((_, i) => {
                // Calculate the actual position this placeholder represents
                const placeholderIndex = existingPhotos.length + i;
                return isOwnProfile ? (
                  <div key={`empty-${i}`} className="flex flex-col">
                    <button
                      onClick={() => handleAddPhotoAt(placeholderIndex)}
                      className="relative w-full rounded-lg border border-dashed border-gray-300 hover:border-[#C9A335] transition-all flex flex-col items-center justify-center group hover:shadow-lg hover:-translate-y-0.5"
                      style={{ paddingBottom: '125%' }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 md:gap-3">
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 group-hover:bg-[#C9A335]/5 transition-colors">
                          <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-[#C9A335] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-xs md:text-sm text-gray-400 group-hover:text-[#C9A335] transition-colors">Add photo</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div key={`placeholder-${i}`} className="flex flex-col items-center">
                    <div className="relative w-full rounded-lg bg-gray-50 border border-gray-200" style={{ paddingBottom: '125%' }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
                          <svg 
                            className="w-5 h-5 md:w-6 md:h-6 text-gray-300" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
                    </div>
                  </div>
                );
              })}
          </div>

            {/* Lightbox */}
            <Lightbox
              open={isLightboxOpen}
              close={() => setIsLightboxOpen(false)}
              index={activePhotoIndex}
              slides={slides}
              styles={{
                root: { backgroundColor: "rgba(0, 0, 0, .9)" },
                button: { filter: "none", color: "#fff" },
                container: { padding: "20px" }
              }}
              animation={{ fade: 400 }}
              carousel={{
                finite: existingPhotos.length <= 1,
                preload: 1,
                padding: "16px",
                spacing: "16px"
              }}
              controller={{
                closeOnBackdropClick: true,
                closeOnPullDown: true,
                closeOnPullUp: true
              }}
              render={{
                buttonPrev: existingPhotos.length <= 1 ? () => null : undefined,
                buttonNext: existingPhotos.length <= 1 ? () => null : undefined,
                iconClose: () => (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              }}
            />
          </>
        ) : (
          /* No photos yet, show placeholders */
          <>
            {isOwnProfile && (
              <p className="text-gray-500 text-center mb-1 text-[clamp(12px,2vw,14px)] leading-none">
                Add 3 featured photos
              </p>
            )}
            
            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
              {isOwnProfile ? (
                // Interactive placeholders for profile owner
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={`empty-${index}`} className="flex flex-col">
                    <button
                      onClick={() => handleAddPhotoAt(index)}
                      className="relative w-full rounded-lg border border-dashed border-gray-300 hover:border-[#C9A335] transition-all flex flex-col items-center justify-center group hover:shadow-lg hover:-translate-y-0.5"
                      style={{ paddingBottom: '125%' }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 md:gap-3">
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 group-hover:bg-[#C9A335]/5 transition-colors">
                          <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-[#C9A335] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-xs md:text-sm text-gray-400 group-hover:text-[#C9A335] transition-colors">Add photo</span>
                      </div>
                    </button>
                  </div>
                ))
              ) : (
                // Non-interactive placeholders for visitors
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={`placeholder-${index}`} className="flex flex-col items-center">
                    <div className="relative w-full rounded-lg bg-gray-50 border border-gray-200" style={{ paddingBottom: '125%' }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
                          <svg 
                            className="w-5 h-5 md:w-6 md:h-6 text-gray-300" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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