'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext, ProfileProvider } from '@/contexts/ProfileContext'
import Link from 'next/link'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import ImageCropper from '@/components/ImageCropper'
import { toast, Toaster } from 'react-hot-toast'

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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingPhoto(true) // Show loading indicator initially
      
      // Show toast message about face detection
      toast('Processing image and detecting faces...', {
        duration: 3000,
      })
      
      const file = e.target.files[0]
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target) {
          setSelectedImage(event.target.result as string)
          setUploadingPhoto(false)
        }
      }
      
      reader.readAsDataURL(file)
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          <p>Error loading profile: {error}</p>
          <button 
            className="mt-2 text-sm text-red-600 hover:underline"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-md">
          <p>Profile not found. Please complete your profile setup.</p>
          <button 
            className="mt-2 text-sm text-yellow-600 hover:underline"
            onClick={() => router.push('/')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <Toaster position="top-center" />
      <div 
        className="min-h-screen flex flex-col"
        style={{
          backgroundColor: "#E5DFD0",
          backgroundImage:
            "radial-gradient(#7D1A1D 0.5px, transparent 0.5px), radial-gradient(#C9A335 0.5px, #E5DFD0 0.5px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Header - Similar to dashboard for consistency */}
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

        <main className="flex-1 flex items-start justify-center py-8 px-4 font-serif">
          <div className="max-w-4xl w-full">
            {/* Profile Header Card */}
            <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden mb-6">
              <div className="bg-[#7D1A1D] text-white py-4 px-6 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex flex-col items-center sm:items-start">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold mb-1 text-shadow">
                    My Profile
                  </h1>
                  <p className="font-serif text-sm text-white/80">
                    View your personal information
                  </p>
                </div>
              </div>
              
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Profile Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 group">
                    {profile.profile_picture_url ? (
                      <>
                        <Image
                          src={profile.profile_picture_url}
                          alt={`${fullName}'s profile picture`}
                          width={128}
                          height={128}
                          className="rounded-full object-cover border-4 border-[#C9A335] shadow-md"
                          priority
                        />
                        {/* Camera Icon Overlay - Facebook style */}
                        {isOwnProfile && (
                          <button 
                            onClick={handleUploadClick}
                            className="absolute right-1 bottom-1 bg-white rounded-full p-1.5 shadow-md opacity-100 focus:outline-none"
                            aria-label="Change profile picture"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7D1A1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="bg-[#7D1A1D] text-white rounded-full w-32 h-32 flex items-center justify-center text-5xl font-serif font-bold border-4 border-[#C9A335] shadow-md">
                          {initials}
                        </div>
                        {/* Camera Icon Overlay on initials avatar */}
                        {isOwnProfile && (
                          <button 
                            onClick={handleUploadClick}
                            className="absolute right-1 bottom-1 bg-white rounded-full p-1.5 shadow-md opacity-100 focus:outline-none"
                            aria-label="Add profile picture"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7D1A1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-[#7D1A1D]">{fullName}</h2>
                  <p className="text-gray-600">{profile.profession || 'Alumnus'}</p>
                </div>
                
                {/* Profile Summary */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 gap-4">
                    {profile.company && (
                      <div className="flex items-start gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7D1A1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Company</p>
                          <p className="font-medium">{profile.company}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile.email && (
                      <div className="flex items-start gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7D1A1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{profile.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile.phone_number && (
                      <div className="flex items-start gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7D1A1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{profile.phone_number}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile.birthday && (
                      <div className="flex items-start gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7D1A1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Birthday</p>
                          <p className="font-medium">{formatDate(profile.birthday)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Personal Information */}
              <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#7D1A1D]/90 text-white py-3 px-6">
                  <h2 className="text-xl font-serif font-bold">Personal Information</h2>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500 text-sm w-40">First Name</td>
                        <td className="py-3 font-medium">{profile.first_name || 'Not provided'}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500 text-sm">Middle Name</td>
                        <td className="py-3 font-medium">{profile.middle_name || 'Not provided'}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500 text-sm">Last Name</td>
                        <td className="py-3 font-medium">{profile.last_name || 'Not provided'}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500 text-sm">Suffix</td>
                        <td className="py-3 font-medium">{profile.suffix_name || 'None'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-sm">Profession</td>
                        <td className="py-3 font-medium">{profile.profession || 'Not provided'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* UPIS Information */}
              <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#7D1A1D]/90 text-white py-3 px-6">
                  <h2 className="text-xl font-serif font-bold">UPIS Information</h2>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500 text-sm w-40">1st Year Section</td>
                        <td className="py-3 font-medium">{profile.section_1st_year || 'Not provided'}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500 text-sm">3rd Year Section</td>
                        <td className="py-3 font-medium">{profile.section_3rd_year || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-500 text-sm">4th Year Section</td>
                        <td className="py-3 font-medium">{profile.section_4th_year || 'Not provided'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Family Information */}
            <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden mb-6">
              <div className="bg-[#7D1A1D]/90 text-white py-3 px-6">
                <h2 className="text-xl font-serif font-bold">Family Information</h2>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-500 text-sm w-40">Spouse</td>
                      <td className="py-3 font-medium">{profile.spouse_name || 'Not provided'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-500 text-sm">Children</td>
                      <td className="py-3 font-medium">{profile.children || 'Not provided'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Interests */}
            <div className="bg-white bg-opacity-95 rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-[#7D1A1D]/90 text-white py-3 px-6">
                <h2 className="text-xl font-serif font-bold">Hobbies & Interests</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-line">
                  {profile.hobbies_interests || 'No hobbies or interests provided.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mb-8">
              <button
                onClick={() => router.push('/')}
                className="text-[#7D1A1D] hover:text-[#7D1A1D]/80 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-[#7D1A1D]/20 mt-auto">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-[#7D1A1D]/70 font-serif">© 2025 UPIS Batch '84 Alumni Portal</p>
                <p className="text-sm text-[#7D1A1D]/70 font-serif">All Rights Reserved</p>
              </div>
              <div className="flex space-x-6">
                <Link href="/privacy-policy" className="text-sm text-[#7D1A1D] hover:underline font-serif">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-use" className="text-sm text-[#7D1A1D] hover:underline font-serif">
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
        
        {/* Loading overlay */}
        {uploadingPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7D1A1D] mx-auto mb-4"></div>
              <p className="text-gray-700">Uploading photo...</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Main profile page component that handles session and wraps with ProfileProvider
export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  
  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        if (!session) {
          router.push('/login')
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking session:", error)
        router.push('/login')
      }
    }
    
    checkSession()
  }, [router])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (!session) {
    return null // Will redirect to login in useEffect
  }
  
  return (
    <ProfileProvider user={session.user}>
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