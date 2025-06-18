'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileContext } from '@/contexts/ProfileContext'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Camera, Edit, MapPin, Briefcase, Building, Phone, Mail, Heart, Baby, Calendar } from 'lucide-react'
import { FaChildren } from 'react-icons/fa6'
import ImageCropper from '@/components/ui/ImageCropper'
import FeaturedPhotos from '@/components/features/profile/FeaturedPhotos'
import { Lightbox } from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
// Hobby categories for classification and styling
const HOBBY_CATEGORIES: Record<string, { color: string; hobbies: string[] }> = {
  sports: {
    color: 'bg-orange-500',
    hobbies: ['Running', 'Swimming', 'Basketball', 'Soccer', 'Tennis', 'Golf', 'Cycling', 'Gym', 'Fitness', 'Boxing', 'Martial Arts']
  },
  arts: {
    color: 'bg-purple-500',
    hobbies: ['Painting', 'Drawing', 'Crafting', 'Sketching', 'Photography', 'Design', 'Pottery', 'Sculpture', 'Writing', 'Knitting']
  },
  music: {
    color: 'bg-amber-700',
    hobbies: ['Playing Guitar', 'Piano', 'Singing', 'Drumming', 'Bass', 'Violin', 'Composing', 'DJ']
  },
  outdoor: {
    color: 'bg-green-600',
    hobbies: ['Hiking', 'Camping', 'Fishing', 'Hunting', 'Gardening', 'Climbing', 'Surfing']
  },
  technology: {
    color: 'bg-blue-600',
    hobbies: ['Programming', 'Gaming', 'Robotics', 'Software Development', 'Hardware']
  },
  reading: {
    color: 'bg-indigo-600',
    hobbies: ['Reading', 'Literature', 'Poetry', 'Blogging']
  },
  culinary: {
    color: 'bg-red-500',
    hobbies: ['Cooking', 'Baking', 'Wine Tasting', 'Coffee', 'Beer Brewing']
  },
  collecting: {
    color: 'bg-yellow-600',
    hobbies: ['Collecting Stamps', 'Collecting Coins', 'Collecting Figures', 'Antiques']
  },
  entertainment: {
    color: 'bg-pink-500',
    hobbies: ['Watching Movies', 'Theater', 'TV Shows', 'Streaming']
  },
  wellness: {
    color: 'bg-teal-500',
    hobbies: ['Yoga', 'Meditation', 'Wellness', 'Mindfulness']
  },
  travel: {
    color: 'bg-cyan-600',
    hobbies: ['Traveling', 'Adventure', 'Exploring', 'Backpacking']
  },
  other: {
    color: 'bg-gray-500',
    hobbies: ['Chess', 'Puzzles', 'Woodworking', 'Sewing']
  }
}

// All sections combined for dropdowns
const SECTIONS = [
  // First year sections
  'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  // Second year sections
  'Cricket', 'Cicada', 'Beetle', 'Dragonfly', 'Gasshoper', 'Firefly', 'Ladybug', 'Honeybee', 'Butterfly',
  // Third year sections
  'Silver', 'Platinum', 'Magnanese', 'Gold', 'Calcium', 'Sodium', 'Lithium', 'Iron', 'Copper',
  // Fourth year sections
  'Acacia', 'Agoho', 'Camagong', 'Dao', 'Ipil', 'Lauan', 'Molave', 'Narra', 'Tanguile'
]
import AddressInput from '@/components/ui/AddressInput'
import { Profile } from '@/hooks/useProfile'
import { getProfileById } from '@/utils/profileQueries'

// Update the ProfileContent component to accept viewProfileId
export function ProfileContent({ viewProfileId }: { viewProfileId?: string }) {
  const router = useRouter()
  const { profile: contextProfile, loading: contextLoading, error: contextError, fullName, displayName, nameWithMiddleInitial, initials, refetchProfile, setProfile } = useProfileContext()
  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const [fetchedLoading, setFetchedLoading] = useState(false)
  const [fetchedError, setFetchedError] = useState<string | null>(null)

  // Determine which profile to use
  const activeProfile = isViewMode ? viewedProfile : contextProfile
  const isLoading = isViewMode ? fetchedLoading : contextLoading
  const profileError = isViewMode ? fetchedError : contextError

  useEffect(() => {
    const fetchViewedProfile = async () => {
      if (viewProfileId && viewProfileId !== contextProfile?.id) {
        setIsViewMode(true)
        setFetchedLoading(true)
        setFetchedError(null)
        
        try {
          const profile = await getProfileById(viewProfileId)
          setViewedProfile(profile)
          if (!profile) {
            setFetchedError('Profile not found')
          }
        } catch (error) {
          console.error('Error fetching viewed profile:', error)
          setFetchedError('Failed to load profile')
        } finally {
          setFetchedLoading(false)
        }
      } else {
        setIsViewMode(false)
        setViewedProfile(null)
        setFetchedLoading(false)
        setFetchedError(null)
      }
    }

    fetchViewedProfile()
  }, [viewProfileId, contextProfile?.id])

  const [isEditing, setIsEditing] = useState(false)
  
  // UI state type for editing (arrays for children and hobbies)
  type EditedProfileState = Omit<Partial<Profile>, 'children'> & {
    children?: string[]
    hobbies?: string[]
  }
  
  const [editedProfile, setEditedProfile] = useState<EditedProfileState>({})
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isProfileLightboxOpen, setIsProfileLightboxOpen] = useState(false)
  const [currentChild, setCurrentChild] = useState('')
  const [currentHobby, setCurrentHobby] = useState('')
  const [hobbySuggestions, setHobbySuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [localPrivacySettings, setLocalPrivacySettings] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Initialize edited profile when profile changes
  useEffect(() => {
    if (activeProfile) {
      // Convert string fields to arrays for UI
      const childrenArray = activeProfile.children ? activeProfile.children.split(',').map(c => c.trim()).filter(c => c) : []
      const hobbiesArray = activeProfile.hobbies_interests ? activeProfile.hobbies_interests.split(',').map(h => h.trim()).filter(h => h) : []
      
      setEditedProfile({
        first_name: activeProfile.first_name || '',
        middle_name: activeProfile.middle_name || '',
        last_name: activeProfile.last_name || '',
        birthday: activeProfile.birthday || '',
        profession: activeProfile.profession || '',
        company: activeProfile.company || '',
        phone_number: activeProfile.phone_number || '',
        email: activeProfile.email || '',
        address: activeProfile.address || '',
        spouse_name: activeProfile.spouse_name || '',
        children: childrenArray,
        hobbies: hobbiesArray,
        section_1st_year: activeProfile.section_1st_year || '',
        section_2nd_year: activeProfile.section_2nd_year || '',
        section_3rd_year: activeProfile.section_3rd_year || '',
        section_4th_year: activeProfile.section_4th_year || ''
      })
      setLocalPrivacySettings(activeProfile.privacy_settings || {})
    }
  }, [activeProfile])

  // Handle hobby suggestions
  useEffect(() => {
    if (currentHobby.length > 0) {
      const allHobbies = Object.values(HOBBY_CATEGORIES).flatMap(category => category.hobbies)
      const filtered = allHobbies.filter(hobby => 
        hobby.toLowerCase().includes(currentHobby.toLowerCase()) &&
        !(editedProfile.hobbies || []).includes(hobby)
      )
      setHobbySuggestions(filtered.slice(0, 5))
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [currentHobby, editedProfile.hobbies])

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (activeProfile) {
      // Convert string fields to arrays for UI
      const childrenArray = activeProfile.children ? activeProfile.children.split(',').map(c => c.trim()).filter(c => c) : []
      const hobbiesArray = activeProfile.hobbies_interests ? activeProfile.hobbies_interests.split(',').map(h => h.trim()).filter(h => h) : []
      
      setEditedProfile({
        first_name: activeProfile.first_name || '',
        middle_name: activeProfile.middle_name || '',
        last_name: activeProfile.last_name || '',
        birthday: activeProfile.birthday || '',
        profession: activeProfile.profession || '',
        company: activeProfile.company || '',
        phone_number: activeProfile.phone_number || '',
        email: activeProfile.email || '',
        address: activeProfile.address || '',
        spouse_name: activeProfile.spouse_name || '',
        children: childrenArray,
        hobbies: hobbiesArray,
        section_1st_year: activeProfile.section_1st_year || '',
        section_2nd_year: activeProfile.section_2nd_year || '',
        section_3rd_year: activeProfile.section_3rd_year || '',
        section_4th_year: activeProfile.section_4th_year || ''
      })
      setLocalPrivacySettings(activeProfile.privacy_settings || {})
    }
  }

  const handleSave = async () => {
    if (!activeProfile) return

    try {
      const supabase = createClient()
      
      // Convert arrays back to strings for database
      const profileUpdate = {
        ...editedProfile,
        children: Array.isArray(editedProfile.children) ? editedProfile.children.join(', ') : editedProfile.children,
        hobbies_interests: Array.isArray(editedProfile.hobbies) ? editedProfile.hobbies.join(', ') : editedProfile.hobbies,
        privacy_settings: localPrivacySettings
      }
      
      // Remove the hobbies field since we're using hobbies_interests
      delete profileUpdate.hobbies
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', activeProfile.id)

      if (error) throw error

      // Update the profile in context (convert arrays back to strings)
      const updatedProfile = {
        ...activeProfile,
        ...editedProfile,
        children: Array.isArray(editedProfile.children) ? editedProfile.children.join(', ') : (editedProfile.children || null),
        hobbies_interests: Array.isArray(editedProfile.hobbies) ? editedProfile.hobbies.join(', ') : null,
        privacy_settings: localPrivacySettings
      }
      delete updatedProfile.hobbies // Remove the UI-only field
      setProfile(updatedProfile as Profile)
      setIsEditing(false)
      
      // Refetch to ensure we have the latest data
      await refetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleInputChange = (field: keyof Profile | 'hobbies', value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCroppedImageUpload = async (croppedImageBlob: Blob) => {
    if (!activeProfile) return

    try {
      const supabase = createClient()
      
      // Create a unique filename
      const timestamp = Date.now()
      const filename = `${activeProfile.first_name}_${activeProfile.last_name}_profile_${timestamp}.jpeg`
      const filePath = `${activeProfile.first_name}_${activeProfile.last_name}/profile/${filename}`

      // Upload the cropped image
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, croppedImageBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)

      // Update the profile with the new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', activeProfile.id)

      if (updateError) throw updateError

      // Update the profile in context
      setProfile({ ...activeProfile, profile_picture_url: publicUrl })
      setSelectedImage(null)
      
      // Refetch to ensure we have the latest data
      await refetchProfile()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  const handleCancelCrop = () => {
    setSelectedImage(null)
  }

  const addChild = (childName: string) => {
    if (childName.trim() && !editedProfile.children?.includes(childName.trim())) {
      const updatedChildren = [...(editedProfile.children || []), childName.trim()]
      handleInputChange('children', updatedChildren)
      setCurrentChild('')
    }
  }

  const removeChild = (index: number) => {
    const updatedChildren = editedProfile.children?.filter((_, i) => i !== index) || []
    handleInputChange('children', updatedChildren)
  }

  const addHobby = (hobby: string) => {
    if (hobby.trim() && !editedProfile.hobbies?.includes(hobby.trim())) {
      const updatedHobbies = [...(editedProfile.hobbies || []), hobby.trim()]
      handleInputChange('hobbies', updatedHobbies)
      setCurrentHobby('')
      setShowSuggestions(false)
    }
  }

  const removeHobby = (hobby: string) => {
    const updatedHobbies = editedProfile.hobbies?.filter(h => h !== hobby) || []
    handleInputChange('hobbies', updatedHobbies)
  }

  const getHobbyCategory = (hobby: string) => {
    for (const [categoryName, category] of Object.entries(HOBBY_CATEGORIES)) {
      if (category.hobbies.includes(hobby)) {
        return categoryName
      }
    }
    return 'other'
  }

  const updatePrivacySetting = async (field: string) => {
    if (!activeProfile) return

    const newSettings = {
      ...localPrivacySettings,
      [field]: !localPrivacySettings?.[field]
    }
    
    setLocalPrivacySettings(newSettings)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: newSettings })
        .eq('id', activeProfile.id)

      if (error) throw error

      // Update the profile in context
      setProfile({ ...activeProfile, privacy_settings: newSettings })
    } catch (error) {
      console.error('Error updating privacy setting:', error)
      // Revert the local state if the update failed
      setLocalPrivacySettings(localPrivacySettings)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 border border-gray-600 text-gray-300 px-4 py-3 rounded-md">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 border border-red-500 text-red-400 px-4 py-3 rounded-md">
          <p>Error loading profile: {profileError || 'Profile not found'}</p>
          <button
            className="mt-2 text-sm text-red-400 hover:underline"
            onClick={() => router.push('/')}
          >
            Go back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-[#7D1A1D]">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        {/* New Layout Structure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          {/* Left Column */}
          <div className="contents md:contents-none md:block md:col-span-5">
            {/* Profile Picture Section */}
            <div className="bg-white bg-opacity-95 border-2 border-[#006633] rounded-lg shadow-md p-6 pb-3 sm:pb-6 flex flex-col items-center order-1 relative">
              <h2 className="text-3xl font-bold text-center mb-1 text-[#7D1A1D]">
                {isViewMode ? viewedProfile?.first_name + ' ' + viewedProfile?.last_name : displayName}
              </h2>
              <div className="text-gray-600 text-sm font-medium mb-3">Alumni</div>

              <div className="w-full max-w-[98%] md:max-w-[90%] lg:max-w-[98%] mx-auto mb-3">
                {activeProfile?.profile_picture_url ? (
                  <div className="aspect-square w-full relative">
                    {/* Golden ring background */}
                    <div className="absolute inset-0 rounded-full bg-[#C9A335] z-0"></div>
                    
                    {/* Profile picture with golden ring effect */}
                    <div
                      className="absolute inset-[22px] rounded-full overflow-hidden z-10 shadow-[0_8px_24px_rgba(0,0,0,0.7)] cursor-pointer"
                      onClick={() => setIsProfileLightboxOpen(true)}
                    >
                      <Image
                        src={activeProfile?.profile_picture_url}
                        alt={`${isViewMode ? viewedProfile?.first_name + ' ' + viewedProfile?.last_name : fullName}'s profile picture`}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    
                    {/* Camera icon for editing (only show if not in view mode) */}
                    {!isViewMode && (
                      <div className="absolute z-30" style={{ right: '8%', bottom: '11%', transform: 'translate(0%, 0%)' }}>
                        <button
                          onClick={handleUploadClick}
                          className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#C9A335]"
                          aria-label="Change profile picture"
                        >
                          <Camera size={20} className="text-[#7D1A1D]" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square w-full relative">
                    {/* Golden ring background */}
                    <div className="absolute inset-0 rounded-full bg-[#C9A335] z-0"></div>
                    
                    {/* Initials with golden ring effect */}
                    <div className="absolute inset-[22px] rounded-full overflow-hidden z-10 shadow-[0_8px_24px_rgba(0,0,0,0.7)] bg-gray-200 flex items-center justify-center">
                      <span className="text-7xl font-bold text-[#7D1A1D]">{initials}</span>
                    </div>
                    
                    {/* Camera icon for adding profile picture (only show if not in view mode) */}
                    {!isViewMode && (
                      <div className="absolute z-30" style={{ right: '8%', bottom: '11%', transform: 'translate(0%, 0%)' }}>
                        <button
                          onClick={handleUploadClick}
                          className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#C9A335]"
                          aria-label="Add profile picture"
                        >
                          <Camera size={20} className="text-[#7D1A1D]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center mb-4 mt-2 relative">
                {isEditing ? (
                  <div className="flex flex-nowrap justify-center gap-1 px-1 overflow-x-auto max-w-full scrollbar-hide">
                    <div className="flex-shrink-0">
                      <select
                        name="section_1st_year"
                        value={editedProfile.section_1st_year || ''}
                        onChange={(e) => handleInputChange('section_1st_year', e.target.value)}
                        className="bg-[#333333] text-[10px] sm:text-xs border-0 rounded-full px-1.5 sm:px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-green-600 min-w-[60px]"
                      >
                        <option value="">1st</option>
                        {SECTIONS.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-shrink-0">
                      <select
                        name="section_2nd_year"
                        value={editedProfile.section_2nd_year || ''}
                        onChange={(e) => handleInputChange('section_2nd_year', e.target.value)}
                        className="bg-[#333333] text-[10px] sm:text-xs border-0 rounded-full px-1.5 sm:px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-amber-500 min-w-[60px]"
                      >
                        <option value="">2nd</option>
                        {SECTIONS.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-shrink-0">
                      <select
                        name="section_3rd_year"
                        value={editedProfile.section_3rd_year || ''}
                        onChange={(e) => handleInputChange('section_3rd_year', e.target.value)}
                        className="bg-[#333333] text-[10px] sm:text-xs border-0 rounded-full px-1.5 sm:px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-red-600 min-w-[60px]"
                      >
                        <option value="">3rd</option>
                        {SECTIONS.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-shrink-0">
                      <select
                        name="section_4th_year"
                        value={editedProfile.section_4th_year || ''}
                        onChange={(e) => handleInputChange('section_4th_year', e.target.value)}
                        className="bg-[#333333] text-[10px] sm:text-xs border-0 rounded-full px-1.5 sm:px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-blue-600 min-w-[60px]"
                      >
                        <option value="">4th</option>
                        {SECTIONS.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-nowrap justify-center gap-1 px-1 overflow-x-auto max-w-full scrollbar-hide">
                    {activeProfile?.section_1st_year && (
                      <span className="bg-green-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                        {activeProfile.section_1st_year}
                      </span>
                    )}
                    {activeProfile?.section_2nd_year && (
                      <span className="bg-amber-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                        {activeProfile.section_2nd_year}
                      </span>
                    )}
                    {activeProfile?.section_3rd_year && (
                      <span className="bg-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                        {activeProfile.section_3rd_year}
                      </span>
                    )}
                    {activeProfile?.section_4th_year && (
                      <span className="bg-blue-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                        {activeProfile.section_4th_year}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Edit/Save/Cancel buttons (only show if not in view mode) */}
              {!isViewMode && (
                <div className="flex gap-2 mt-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-[#006633] text-white px-3 py-1 rounded text-sm hover:bg-[#005529] transition-colors flex items-center gap-1"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="bg-[#7D1A1D] text-white px-3 py-1 rounded text-sm hover:bg-[#6B1619] transition-colors flex items-center gap-1"
                    >
                      <span>Edit Sections</span>
                      <Edit size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Featured Photos Section */}
            <div className="bg-white bg-opacity-95 border-2 border-[#006633] rounded-lg shadow-md p-6 order-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#7D1A1D]">Featured Photos</h2>
                {!isViewMode && (
                  <button className="text-[#7D1A1D] hover:text-[#6B1619] transition-colors flex items-center gap-1 text-sm">
                    <span>Edit Photos</span>
                    <Edit size={14} />
                  </button>
                )}
              </div>
              <div className="h-[300px]">
                <FeaturedPhotos 
                  userId={activeProfile?.id || ''} 
                  userFolderName={`${activeProfile?.first_name || 'user'}_${activeProfile?.last_name || 'profile'}`}
                  isOwnProfile={!isViewMode}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-7 order-3">
            <div className="bg-white bg-opacity-95 border-2 border-[#006633] rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#7D1A1D]">Personal Information</h2>
                {!isViewMode && (
                  <button
                    onClick={isEditing ? handleSave : handleEdit}
                    className="text-[#7D1A1D] hover:text-[#6B1619] transition-colors flex items-center gap-1 text-sm"
                  >
                    <span>{isEditing ? 'Save' : 'Edit Info'}</span>
                    <Edit size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Full Name
                    </p>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editedProfile.first_name || ''}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            placeholder="First Name"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="text"
                            value={editedProfile.middle_name || ''}
                            onChange={(e) => handleInputChange('middle_name', e.target.value)}
                            placeholder="Middle Name"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="text"
                            value={editedProfile.last_name || ''}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            placeholder="Last Name"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      ) : (
                        <p className="font-medium break-words">
                          {isViewMode ? 
                            `${viewedProfile?.first_name || ''} ${viewedProfile?.middle_name || ''} ${viewedProfile?.last_name || ''}`.trim() || 'Not provided' :
                            nameWithMiddleInitial || 'Not provided'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Birthday
                    </p>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedProfile.birthday || ''}
                          onChange={(e) => handleInputChange('birthday', e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <p className="font-medium break-words">
                          {activeProfile?.birthday ? 
                            new Date(activeProfile.birthday).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 
                            'Not provided'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profession */}
                <div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Profession
                    </p>
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.profession || ''}
                          onChange={(e) => handleInputChange('profession', e.target.value)}
                          placeholder="Your profession"
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <p className="font-medium break-words">
                          {activeProfile?.profession ? (
                            <span className="text-gray-800">{activeProfile.profession}</span>
                          ) : (
                            <span className="text-gray-500">Not provided</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company
                    </p>
                    <div className="flex items-start">
                      <Building className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.company || ''}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Your company"
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <p className="font-medium break-words">
                          {activeProfile?.company ? (
                            <span className="text-gray-800">{activeProfile.company}</span>
                          ) : (
                            <span className="text-gray-500">Not provided</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="sm:col-span-2 mt-4 mb-4">
                  <div className="border-t border-gray-200"></div>
                </div>

                {/* Phone */}
                <div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                      {!isViewMode && (
                        <button
                          onClick={() => updatePrivacySetting('phone')}
                          className="ml-auto text-xs flex items-center gap-1"
                          title={localPrivacySettings?.phone ? "Click to make private" : "Click to make public"}
                        >
                          <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.phone ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                            <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.phone ? 'translate-x-3' : ''}`} />
                          </div>
                          <span className={localPrivacySettings?.phone ? 'text-[#C9A335]' : 'text-green-600'}>
                            {localPrivacySettings?.phone ? 'Private' : 'Public'}
                          </span>
                        </button>
                      )}
                    </p>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedProfile.phone_number || ''}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          placeholder="Your phone number"
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <p className="font-medium break-words">
                          {(isViewMode && localPrivacySettings?.phone) ? (
                            <span className="text-gray-500">Private</span>
                          ) : activeProfile?.phone_number ? (
                            <span className="text-gray-800">{activeProfile.phone_number}</span>
                          ) : (
                            <span className="text-gray-500">Not provided</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                      {!isViewMode && (
                        <button
                          onClick={() => updatePrivacySetting('email')}
                          className="ml-auto text-xs flex items-center gap-1"
                          title={localPrivacySettings?.email ? "Click to make private" : "Click to make public"}
                        >
                          <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.email ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                            <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.email ? 'translate-x-3' : ''}`} />
                          </div>
                          <span className={localPrivacySettings?.email ? 'text-[#C9A335]' : 'text-green-600'}>
                            {localPrivacySettings?.email ? 'Private' : 'Public'}
                          </span>
                        </button>
                      )}
                    </p>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedProfile.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Your email address"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <p className="font-medium break-words">
                            {(isViewMode && localPrivacySettings?.email) ? (
                              <span className="text-gray-500">Private</span>
                            ) : activeProfile?.email ? (
                              <span className="text-gray-800">{activeProfile.email}</span>
                            ) : (
                              <span className="text-gray-500">Not provided</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                    {!isViewMode && (
                      <button
                        onClick={() => updatePrivacySetting('address')}
                        className="ml-auto text-xs flex items-center gap-1"
                        title={localPrivacySettings?.address ? "Click to make private" : "Click to make public"}
                      >
                        <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.address ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                          <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.address ? 'translate-x-3' : ''}`} />
                        </div>
                        <span className={localPrivacySettings?.address ? 'text-[#C9A335]' : 'text-green-600'}>
                          {localPrivacySettings?.address ? 'Private' : 'Public'}
                        </span>
                      </button>
                    )}
                  </p>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      {isEditing ? (
                        <AddressInput
                          value={editedProfile.address || ''}
                          onChange={(value) => handleInputChange('address', value)}
                          isEditing={true}
                        />
                      ) : (
                        <div>
                          {(isViewMode && localPrivacySettings?.address) ? (
                            <span className="text-gray-500">Private</span>
                          ) : activeProfile?.address ? (
                            <span className="text-gray-800">{activeProfile.address}</span>
                          ) : (
                            <span className="text-gray-500">Not provided</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="sm:col-span-2 mt-4 mb-4">
                  <div className="border-t border-gray-200"></div>
                </div>

                {/* Spouse */}
                <div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Spouse
                      {!isViewMode && (
                        <button
                          onClick={() => updatePrivacySetting('spouse')}
                          className="ml-auto text-xs flex items-center gap-1"
                          title={localPrivacySettings?.spouse ? "Click to make private" : "Click to make public"}
                        >
                          <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.spouse ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                            <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.spouse ? 'translate-x-3' : ''}`} />
                          </div>
                          <span className={localPrivacySettings?.spouse ? 'text-[#C9A335]' : 'text-green-600'}>
                            {localPrivacySettings?.spouse ? 'Private' : 'Public'}
                          </span>
                        </button>
                      )}
                    </p>
                    <div className="flex items-start">
                      <Heart className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.spouse_name || ''}
                          onChange={(e) => handleInputChange('spouse_name', e.target.value)}
                          placeholder="Spouse's name"
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <p className="font-medium break-words">
                          {(isViewMode && localPrivacySettings?.spouse) ? (
                            <span className="text-gray-500">Private</span>
                          ) : activeProfile?.spouse_name ? (
                            <span className="text-gray-800">{activeProfile.spouse_name}</span>
                          ) : (
                            <span className="text-gray-500">Not provided</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Children */}
                <div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                      <FaChildren className="h-4 w-4" />
                      Children
                      {!isViewMode && (
                        <button
                          onClick={() => updatePrivacySetting('children')}
                          className="ml-auto text-xs flex items-center gap-1"
                          title={localPrivacySettings?.children ? "Click to make private" : "Click to make public"}
                        >
                          <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.children ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                            <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.children ? 'translate-x-3' : ''}`} />
                          </div>
                          <span className={localPrivacySettings?.children ? 'text-[#C9A335]' : 'text-green-600'}>
                            {localPrivacySettings?.children ? 'Private' : 'Public'}
                          </span>
                        </button>
                      )}
                    </p>
                    <div className="flex items-start">
                      <FaChildren className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                      {isEditing ? (
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(editedProfile.children || []).map((child, index) => (
                              <span
                                key={index}
                                className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded border border-gray-400 flex items-center"
                              >
                                {child}
                                <button
                                  onClick={() => removeChild(index)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                  type="button"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={currentChild}
                              onChange={(e) => setCurrentChild(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addChild(currentChild)}
                              placeholder="Add child's name"
                            />
                            {currentChild && (
                              <button
                                onClick={() => addChild(currentChild)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800"
                                type="button"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="font-medium break-words">
                          {(isViewMode && localPrivacySettings?.children) ? (
                            <span className="text-gray-500">Private</span>
                          ) : (editedProfile.children && editedProfile.children.length > 0) ? (
                            <span className="text-gray-800">
                              {editedProfile.children.join(', ')}
                            </span>
                          ) : (
                            <span className="text-gray-500">Not provided</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="sm:col-span-2 mt-4 mb-4">
                  <div className="border-t border-gray-200"></div>
                </div>

                {/* Hobbies & Interests */}
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Hobbies & interests</p>
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(editedProfile.hobbies || []).map((hobby) => {
                        const category = getHobbyCategory(hobby)
                        return (
                          <span
                            key={hobby}
                            className={`${HOBBY_CATEGORIES[category].color} text-white text-xs px-2 py-0.5 rounded-full flex items-center`}
                          >
                            {hobby}
                            {isEditing && (
                              <button
                                onClick={() => removeHobby(hobby)}
                                className="ml-1 text-white hover:text-red-200"
                                type="button"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        )
                      })}
                    </div>
                    {isEditing && (
                      <div className="relative w-48">
                        <input
                          type="text"
                          value={currentHobby}
                          onChange={(e) => setCurrentHobby(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addHobby(currentHobby)}
                          placeholder="Add a hobby then Enter"
                        />
                        {showSuggestions && (
                          <div
                            ref={suggestionsRef}
                            className="absolute z-10 mt-1 w-full max-h-28 overflow-y-auto bg-[#1E1E1E] rounded shadow-md border border-gray-700"
                          >
                            {hobbySuggestions.map((hobby) => (
                              <button
                                key={hobby}
                                onClick={() => addHobby(hobby)}
                                className="block w-full text-left px-3 py-1 text-white hover:bg-[#333333] text-sm"
                                type="button"
                              >
                                {hobby}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white bg-opacity-95 border-2 border-[#006633] rounded-lg shadow-md p-6 h-[400px] flex items-center justify-center order-4 mt-6">
          <p className="text-gray-500">Timeline Section (Coming Soon)</p>
        </div>
        </div>

      {/* Image Cropper Modal */}
      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCroppedImageUpload}
          onCancel={handleCancelCrop}
        />
      )}
      
      {/* Hidden file input for profile picture uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }}
      />

      {/* Profile Picture Lightbox */}
      {isProfileLightboxOpen && (
        <Lightbox
        open={isProfileLightboxOpen}
        close={() => setIsProfileLightboxOpen(false)}
        slides={[{
          src: activeProfile?.profile_picture_url || '',
          alt: `${isViewMode ? viewedProfile?.first_name + ' ' + viewedProfile?.last_name : fullName}'s profile picture`
        }]}
        styles={{
          root: { backgroundColor: "rgba(0, 0, 0, .9)" },
          button: { filter: "none", color: "#fff" },
          container: { padding: "20px" }
        }}
        animation={{ fade: 400 }}
        carousel={{
          finite: true,
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
          buttonPrev: () => null,
          buttonNext: () => null,
          iconClose: () => (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        }}
        />
      )}
    </div>
  )
}