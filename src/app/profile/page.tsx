'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext, ProfileProvider } from '@/contexts/ProfileContext'
import Link from 'next/link'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import ImageCropper from '@/components/ImageCropper'
import FeaturedPhotos from '@/components/FeaturedPhotos'

// Function to format date strings for display
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not provided'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Profile content component
function ProfileContent() {
  const router = useRouter()
  const { profile, loading, error, fullName, initials, refetchProfile } = useProfileContext()
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  
  // Check if this is the user's own profile
  useEffect(() => {
    const checkProfileOwnership = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && profile && session.user.id === profile.id) {
        setIsOwnProfile(true)
      }
    }
    
    checkProfileOwnership()
  }, [profile, supabase.auth])
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    
    // Create a preview for the cropper
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }
  
  // Handle cropped image upload
  const handleCroppedImageUpload = async (croppedBlob: Blob) => {
    if (!profile) return
    
    try {
      setUploadingPhoto(true)
      
      // Create user folder name - use fullName or fallback to user ID if no name available
      const userFolderName = fullName.replace(/\s+/g, '_') || profile.id
      
      // Create a unique file name
      const fileName = `${Date.now()}.jpeg`
      
      // Use user-specific folder structure
      const filePath = `${userFolderName}/profile/${fileName}`
      
      console.log("Uploading to:", filePath)
      
      // Upload the file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, croppedBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        })
      
      if (uploadError) {
        console.error("Upload error details:", uploadError)
        throw uploadError
      }
      
      console.log("Upload successful:", data)
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)
      
      console.log("Public URL:", publicUrl)
      
      // Update the profile with the new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', profile.id)
      
      if (updateError) {
        console.error("Profile update error:", updateError)
        throw updateError
      }
      
      // Refresh the profile data
      await refetchProfile()
      
      // Clear the selected image
      setSelectedImage(null)
      
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }
  
  // Cancel cropping
  const handleCancelCrop = () => {
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  
  // Trigger file selection dialog
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C9A335]"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 border border-red-500 text-red-400 px-4 py-3 rounded-md">
          <p>Error loading profile: {error}</p>
          <button 
            className="mt-2 text-sm text-red-400 hover:underline"
            onClick={() => router.push('/')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 border border-yellow-500 text-yellow-400 px-4 py-3 rounded-md">
          <p>Profile not found. Please complete your profile setup.</p>
          <button 
            className="mt-2 text-sm text-yellow-400 hover:underline"
            onClick={() => router.push('/')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#1E1E1E] text-white">
      {/* Header - Keep existing header */}
      <header className="bg-[#7D1A1D] text-white py-3 shadow-md sticky top-0 z-50">
        <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8">
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-[#C9A335] shadow-md">
                <Image
                  src="/images/logo.svg"
                  alt="UPIS 84 Logo"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <span className="font-serif font-bold text-base md:text-lg line-clamp-1">UPIS Alumni Portal</span>
            </Link>
          </div>
          
          {/* Back to Dashboard Button */}
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white bg-[#7D1A1D]/80 hover:bg-[#7D1A1D]/90 py-2 px-4 rounded-md transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-[#242424] rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-center mb-2">{fullName}</h2>
            <div className="text-[#C9A335] text-sm font-medium mb-6">Alumni</div>
            
            <div className="relative mb-6">
              {profile.profile_picture_url ? (
                <div className="w-80 h-80 rounded-full overflow-hidden border-8 border-gray-700 shadow-lg">
                  <div className="w-full h-full relative">
                    <Image
                      src={profile.profile_picture_url}
                      alt={`${fullName}'s profile picture`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {isOwnProfile && (
                    <button 
                      onClick={handleUploadClick}
                      className="absolute right-4 bottom-4 bg-[#242424] rounded-full p-3 shadow-md opacity-90 hover:opacity-100 transition-opacity focus:outline-none"
                      aria-label="Change profile picture"
                    >
                      <Camera size={24} className="text-[#C9A335]" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-80 h-80 rounded-full bg-gray-700 flex items-center justify-center text-7xl font-bold border-8 border-gray-700 shadow-lg">
                  {initials}
                  
                  {isOwnProfile && (
                    <button 
                      onClick={handleUploadClick}
                      className="absolute right-4 bottom-4 bg-[#242424] rounded-full p-3 shadow-md opacity-90 hover:opacity-100 transition-opacity focus:outline-none"
                      aria-label="Add profile picture"
                    >
                      <Camera size={24} className="text-[#C9A335]" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Bio & Details Card */}
          <div className="bg-[#242424] rounded-xl p-6 md:col-span-2">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
              Bio & other details
              {isOwnProfile && (
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Full Name</h3>
                  <p className="font-medium">{fullName}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Profession</h3>
                  <p className="font-medium">{profile.profession || 'Not provided'}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Birthday</h3>
                  <p className="font-medium">{formatDate(profile.birthday)}</p>
                </div>
              </div>
              
              {/* UPIS Information */}
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">1st Year Section</h3>
                  <p className="font-medium">{profile.section_1st_year || 'Not provided'}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">2nd Year Section</h3>
                  <p className="font-medium">{profile.section_2nd_year || 'Not provided'}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">3rd Year Section</h3>
                  <p className="font-medium">{profile.section_3rd_year || 'Not provided'}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">4th Year Section</h3>
                  <p className="font-medium">{profile.section_4th_year || 'Not provided'}</p>
                </div>
              </div>
              
              {/* Family Information */}
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Spouse</h3>
                  <p className="font-medium">{profile.spouse_name || 'Not provided'}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Children</h3>
                  <p className="font-medium">{profile.children || 'Not provided'}</p>
                </div>
              </div>
              
              {/* Hobbies & Interests */}
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Hobbies & Interests</h3>
                  <p className="font-medium whitespace-pre-line">{profile.hobbies_interests || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Photos Section */}
        <div className="mt-6 bg-[#242424] rounded-xl overflow-hidden">
          <FeaturedPhotos 
            userId={profile.id} 
            userFolderName={fullName.replace(/\s+/g, '_') || profile.id}
            isOwnProfile={isOwnProfile}
            onComplete={refetchProfile}
          />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-400">© 2025 UPIS Batch '84 Alumni Portal</p>
              <p className="text-sm text-gray-400">All Rights Reserved</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-sm text-gray-300 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="text-sm text-gray-300 hover:underline">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Image Cropper Modal */}
      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCroppedImageUpload}
          onCancel={handleCancelCrop}
        />
      )}
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden"
        aria-hidden="true"
      />
      
      {/* Loading Overlay */}
      {uploadingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#242424] p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#C9A335] mx-auto mb-4"></div>
            <p className="text-gray-300">Uploading photo...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapper component with provider
export default function ProfilePage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    
    getUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [supabase.auth])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C9A335]"></div>
      </div>
    )
  }
  
  return (
    <ProfileProvider user={user}>
      <ProfileContent />
    </ProfileProvider>
  )
}

{/* Add text-shadow utility class */}
<style jsx global>{`
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`}</style> 