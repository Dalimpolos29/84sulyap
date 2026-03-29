'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext, ProfileProvider } from '@/contexts/ProfileContext'
import Link from 'next/link'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import ImageCropper from '@/components/ui/ImageCropper'
import FeaturedPhotos from '@/components/features/profile/FeaturedPhotos'
import { FaIdCard, FaBriefcase, FaPhone, FaChildren, FaLocationDot, FaBuilding } from "react-icons/fa6";
import { FaBirthdayCake } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { GiBigDiamondRing } from "react-icons/gi";
import AddressInput from '@/components/ui/AddressInput'
import { useProfile, Profile } from '@/hooks/useProfile'

import Lightbox from "yet-another-react-lightbox"
import LoginPage from '@/app/(auth)/login/page'

// Function to format date strings for display
const formatDate = (dateString: string | null | undefined): string => {
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

// Hobby categories and their keywords for classification
const HOBBY_CATEGORIES: Record<string, { color: string, keywords: string[] }> = {
  sports: {
    color: 'bg-orange-500',
    keywords: ['sport', 'ball', 'running', 'swim', 'tennis', 'soccer', 'basketball', 'football', 'volleyball', 'baseball', 'golf', 'cycling', 'gym', 'fitness', 'workout', 'boxing', 'martial']
  },
  arts: {
    color: 'bg-purple-500',
    keywords: ['art', 'paint', 'draw', 'craft', 'sketch', 'photography', 'design', 'pottery', 'sculpture', 'creative', 'writing', 'knitting']
  },
  music: {
    color: 'bg-amber-700',
    keywords: ['music', 'guitar', 'piano', 'sing', 'drum', 'bass', 'violin', 'instrument', 'band', 'concert', 'compose', 'dj']
  },
  outdoor: {
    color: 'bg-green-600',
    keywords: ['hike', 'camp', 'nature', 'fish', 'hunt', 'garden', 'outdoor', 'climbing', 'mountain', 'beach', 'surf']
  },
  technology: {
    color: 'bg-blue-600',
    keywords: ['tech', 'code', 'program', 'computer', 'game', 'gaming', 'robot', 'software', 'hardware', 'develop']
  },
  reading: {
    color: 'bg-indigo-600',
    keywords: ['read', 'book', 'literature', 'novel', 'poetry', 'writing', 'blog']
  },
  culinary: {
    color: 'bg-red-500',
    keywords: ['cook', 'bake', 'food', 'culinary', 'recipe', 'wine', 'coffee', 'beer', 'taste', 'kitchen']
  },
  collecting: {
    color: 'bg-yellow-600',
    keywords: ['collect', 'stamp', 'coin', 'figure', 'model', 'antique', 'vintage']
  },
  entertainment: {
    color: 'bg-pink-500',
    keywords: ['movie', 'film', 'tv', 'show', 'theater', 'cinema', 'series', 'streaming', 'actor', 'actress']
  },
  wellness: {
    color: 'bg-teal-500',
    keywords: ['yoga', 'meditate', 'meditation', 'wellness', 'mindful', 'health', 'spiritual', 'relax']
  },
  travel: {
    color: 'bg-cyan-600',
    keywords: ['travel', 'adventure', 'explore', 'trip', 'journey', 'backpack', 'tourist', 'vacation']
  },
  other: {
    color: 'bg-gray-500',
    keywords: []
  }
};

// Common hobbies for suggestions
const COMMON_HOBBIES = [
  'Reading', 'Running', 'Swimming', 'Cooking', 'Baking', 'Painting', 
  'Photography', 'Hiking', 'Gardening', 'Yoga', 'Meditation', 'Cycling', 
  'Playing Guitar', 'Piano', 'Singing', 'Dancing', 'Writing', 'Traveling', 
  'Fishing', 'Camping', 'Basketball', 'Soccer', 'Tennis', 'Golf', 
  'Video Games', 'Programming', 'Chess', 'Puzzles', 'Watching Movies', 
  'Collecting Stamps', 'Knitting', 'Sewing', 'Woodworking'
];

// First year section options
const FIRST_YEAR_SECTIONS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

// Second year section options
const SECOND_YEAR_SECTIONS = ['Cricket', 'Cicada', 'Beetle', 'Dragonfly', 'Gasshoper', 'Firefly', 'Ladybug', 'Honeybee', 'Butterfly'];

// Third year section options
const THIRD_YEAR_SECTIONS = ['Silver', 'Platinum', 'Magnanese', 'Gold', 'Calcium', 'Sodium', 'Lithium', 'Iron', 'Copper'];

// Fourth year section options
const FOURTH_YEAR_SECTIONS = ['Acacia', 'Agoho', 'Camagong', 'Dao', 'Ipil', 'Lauan', 'Molave', 'Narra', 'Tanguile'];

// Helper function to determine hobby category
const getHobbyCategory = (hobby: string): string => {
  const hobbyLower = hobby.toLowerCase();
  
  for (const [category, data] of Object.entries(HOBBY_CATEGORIES)) {
    if (category === 'other') continue; // Skip the default category
    if (data.keywords.some(keyword => hobbyLower.includes(keyword))) {
      return category;
    }
  }
  
  return 'other'; // Default category
};

// Add viewProfileId to the component props
// Updated to support Next.js 15 routing mechanism
interface ProfilePageProps {
  params?: Promise<{
    id?: string;
  }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

// Update the ProfileContent component to accept viewProfileId
function ProfileContent({ viewProfileId }: { viewProfileId?: string }) {
  const router = useRouter()
  const { profile: contextProfile, loading: contextLoading, error: contextError, fullName, displayName, nameWithMiddleInitial, initials, refetchProfile, setProfile } = useProfileContext()
  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSections, setEditingSections] = useState(false)
  const [editData, setEditData] = useState({
    bio: '',
    profession: '',
    company: '',
    email: '',
    phone_number: '',
    spouse_name: '',
    children: '',
    hobbies_interests: '',
    section_1st_year: '',
    section_2nd_year: '',
    section_3rd_year: '',
    section_4th_year: '',
    address: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  
  // Hobby management
  const [currentHobby, setCurrentHobby] = useState('')
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  // Memoized filtered suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!currentHobby.trim()) return [];
    const input = currentHobby.toLowerCase().trim();
    return COMMON_HOBBIES
      .filter(hobby => hobby.toLowerCase().includes(input) && 
              !selectedHobbies.includes(hobby))
      .slice(0, 5); // Limit to 5 suggestions
  }, [currentHobby, selectedHobbies]);
  
  // Parse hobbies from string or array
  const parseHobbies = (hobbiesValue: string[] | string | null): string[] => {
    if (!hobbiesValue) return [];
    
    // If it's already an array, just clean it
    if (Array.isArray(hobbiesValue)) {
      return hobbiesValue.map(h => h.trim()).filter(h => h !== '');
    }
    
    // If it's a string, split by semicolons
    return hobbiesValue.split(';')
      .map(h => h.trim())
      .filter(h => h !== '');
  };
  
  // Format hobbies to string or array based on database needs
  const formatHobbies = (hobbies: string[]): string[] => {
    if (!hobbies || !Array.isArray(hobbies) || hobbies.length === 0) return [];
    return hobbies.map(h => h.trim()).filter(h => h !== '');
  };
  
  // Add a hobby to the selected list
  const addHobby = (hobby: string) => {
    const trimmedHobby = hobby.trim();
    if (!trimmedHobby || selectedHobbies.includes(trimmedHobby)) return;
    
    setSelectedHobbies(prev => [...prev, trimmedHobby]);
    setCurrentHobby('');
  };
  
  // Remove a hobby from the selected list
  const removeHobby = (hobby: string) => {
    setSelectedHobbies(prev => prev.filter(h => h !== hobby));
  };
  
  // Handle hobby input changes
  const handleHobbyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentHobby(e.target.value);
    setShowSuggestions(true);
  };
  
  // Handle hobby input keydown for adding with Enter
  const handleHobbyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentHobby.trim()) {
      e.preventDefault();
      
      // If there's a matching suggestion, use it
      const matchingSuggestion = filteredSuggestions[0];
      if (matchingSuggestion && matchingSuggestion.toLowerCase().startsWith(currentHobby.toLowerCase())) {
        addHobby(matchingSuggestion);
      } else {
        // Otherwise use the exact text typed
        addHobby(currentHobby);
      }
    }
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Effect to fetch profile data based on viewProfileId
  useEffect(() => {
    async function fetchViewedProfile() {
      try {
      const { data: { session } } = await supabase.auth.getSession()
        
        if (!viewProfileId) {
          // No viewProfileId means we're on our own profile page
          setIsViewMode(false)
        setIsOwnProfile(true)
          return
        }

        // Check if viewing own profile through viewProfileId
        const isOwn = session?.user?.id === viewProfileId
        setIsOwnProfile(isOwn)
        setIsViewMode(!isOwn)

        // Always fetch profile data when there's a viewProfileId
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', viewProfileId)
          .single()

        if (error) throw error
        setViewedProfile(data as Profile)
        
        // Initialize children list if viewing own profile
        if (isOwn && data) {
          setChildrenList(parseChildren(data.children))
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchViewedProfile()
  }, [viewProfileId])

  // Use either viewed profile or context profile
  const activeProfile = viewedProfile || contextProfile
  
  // Calculate initials for the active profile (visited user or logged-in user)
  const activeProfileInitials = useMemo(() => {
    if (!activeProfile) return 'U'
    
    if (activeProfile.first_name && activeProfile.last_name) {
      return `${activeProfile.first_name.charAt(0)}${activeProfile.last_name.charAt(0)}`.toUpperCase()
    }
    
    if (activeProfile.first_name) {
      return activeProfile.first_name.charAt(0).toUpperCase()
    }
    
    if (activeProfile.last_name) {
      return activeProfile.last_name.charAt(0).toUpperCase()
    }
    
    return 'U'
  }, [activeProfile])
  
  // Modify existing useEffect for edit data
  useEffect(() => {
    if (activeProfile && !isViewMode) {
      setEditData({
        bio: activeProfile.bio || '',
        profession: activeProfile.profession || '',
        company: activeProfile.company || '',
        email: activeProfile.email || '',
        phone_number: activeProfile.phone_number || '',
        spouse_name: activeProfile.spouse_name || '',
        children: activeProfile.children || '',
        hobbies_interests: activeProfile.hobbies_interests || '',
        section_1st_year: activeProfile.section_1st_year || '',
        section_2nd_year: activeProfile.section_2nd_year || '',
        section_3rd_year: activeProfile.section_3rd_year || '',
        section_4th_year: activeProfile.section_4th_year || '',
        address: activeProfile.address || ''
      })

      // Set selected hobbies
      setSelectedHobbies(parseHobbies(activeProfile.hobbies_interests))
    }
  }, [activeProfile, isViewMode])
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle save profile
  const handleSaveProfile = async () => {
    if (!activeProfile) return

    // Store the previous profile state in case we need to revert on error
    const previousProfile = activeProfile;

    try {
      setIsSaving(true)

      const formattedHobbies = formatHobbies(selectedHobbies);

      const updatedData = {
        bio: editData.bio,
        profession: editData.profession,
        company: editData.company,
        email: editData.email,
        phone_number: editData.phone_number,
        spouse_name: editData.spouse_name,
        children: childrenList, // Send the array directly
        hobbies_interests: formattedHobbies, // Send the array directly
        section_1st_year: editData.section_1st_year,
        section_2nd_year: editData.section_2nd_year,
        section_3rd_year: editData.section_3rd_year,
        section_4th_year: editData.section_4th_year,
        address: editData.address
      };

      console.log('Optimistically updating profile data:', updatedData);

      // --- Optimistic Update --- 
      // Update local context immediately
      setProfile(currentProfile => 
        currentProfile ? { 
          ...currentProfile, 
          ...updatedData,
          // Convert to string for type compatibility but preserve array format in UI
          children: childrenList.join(', '),
          hobbies_interests: formattedHobbies.join('; ')
        } : null
      );
      
      // Exit edit mode immediately for instant UI feedback
      setIsEditing(false);

      // 3. Update database in the background
      const { error: updateError, status } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', activeProfile.id)
        .select(); // Select to confirm update but we don't use the return data here

      if (updateError) {
        console.error('Error updating profile (detailed):', JSON.stringify(updateError));
        throw new Error(updateError.message || 'Unknown error updating profile');
      }

      if (status >= 400) {
        throw new Error(`Error: Status ${status}`);
      }

      console.log('Profile update successful in database.');
      
      // 4. Remove full refetch on success
      // await refetchProfile(); 

    } catch (error: any) {
      console.error('Error saving profile - reverting UI:', error);
      
      // --- Revert Optimistic Update on Error --- 
      // Restore previous profile state in context
      setProfile(previousProfile);
      // Put user back into edit mode if desired, or show error message
      setIsEditing(true); // Go back to edit mode so user sees the unsaved state
      // -----------------------------------------

      let errorMessage = 'Failed to save profile changes';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (error && typeof error === 'object') {
        errorMessage += `: ${JSON.stringify(error)}`;
      }
      alert(errorMessage); // Inform user
      
      // Optional: Call refetchProfile() here if absolutely needed to sync after error
      // await refetchProfile(); 

    } finally {
      setIsSaving(false); // Always stop saving indicator
    }
  }
  
  // Cancel editing
  const handleCancelEdit = () => {
    if (activeProfile) {
      setEditData({
        bio: activeProfile.bio || '',
        profession: activeProfile.profession || '',
        company: activeProfile.company || '',
        email: activeProfile.email || '',
        phone_number: activeProfile.phone_number || '',
        spouse_name: activeProfile.spouse_name || '',
        children: activeProfile.children || '',
        hobbies_interests: activeProfile.hobbies_interests || '',
        section_1st_year: activeProfile.section_1st_year || '',
        section_2nd_year: activeProfile.section_2nd_year || '',
        section_3rd_year: activeProfile.section_3rd_year || '',
        section_4th_year: activeProfile.section_4th_year || '',
        address: activeProfile.address || ''
      })
    }
    setIsEditing(false)
  }
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeProfile) return
    
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
    if (!activeProfile) return

    try {
      setUploadingPhoto(true)

      // Store old profile picture URL for cleanup after successful upload
      const oldProfilePictureUrl = activeProfile.profile_picture_url

      // Create user folder name - use fullName or fallback to user ID if no name available
      const userFolderName = fullName.replace(/\s+/g, '_') || activeProfile.id

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

      // Delete old profile picture from storage (only if upload succeeded and old picture exists)
      if (oldProfilePictureUrl) {
        try {
          // Extract file path from the public URL
          const urlParts = oldProfilePictureUrl.split('/profile-pictures/')
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1]
            console.log("Deleting old profile picture:", oldFilePath)

            const { error: deleteError } = await supabase.storage
              .from('profile-pictures')
              .remove([oldFilePath])

            if (deleteError) {
              console.error("Error deleting old profile picture:", deleteError)
              // Don't throw - we still want to update the profile with new picture
            } else {
              console.log("Old profile picture deleted successfully")
            }
          }
        } catch (deleteErr) {
          console.error("Error during old profile picture cleanup:", deleteErr)
          // Don't throw - we still want to update the profile with new picture
        }
      }

      // Update the profile with the new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', activeProfile.id)

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

  // Section-specific functions
  const startEditingSections = () => {
    setEditingSections(true);
  };

  const cancelEditingSections = () => {
    // Reset section and bio values to original
    if (activeProfile) {
      setEditData(prev => ({
        ...prev,
        bio: activeProfile.bio || '',
        section_1st_year: activeProfile.section_1st_year || '',
        section_2nd_year: activeProfile.section_2nd_year || '',
        section_3rd_year: activeProfile.section_3rd_year || '',
        section_4th_year: activeProfile.section_4th_year || ''
      }));
    }
    setEditingSections(false);
  };

  const saveSectionChanges = async () => {
    if (!activeProfile) return;

    // Store previous state for potential revert
    const previousProfile = activeProfile;

    try {
      // Prepare section and bio update data
      const updatedData = {
        bio: editData.bio,
        section_1st_year: editData.section_1st_year,
        section_2nd_year: editData.section_2nd_year,
        section_3rd_year: editData.section_3rd_year,
        section_4th_year: editData.section_4th_year
      };

      // --- Optimistic Update ---
      // 1. Update local context immediately
      setProfile(currentProfile =>
        currentProfile ? { ...currentProfile, ...updatedData } : null
      );
      // 2. Exit section editing mode immediately
      setEditingSections(false);
      // -------------------------

      // 3. Update database in background
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', activeProfile.id);

  if (error) {
        throw error;
      }

      console.log('Section and bio changes updated successfully in database.');

      // 4. Remove full refetch on success
      // await refetchProfile();

    } catch (error: any) {
      console.error('Error saving section and bio changes - reverting UI:', error);

      // --- Revert Optimistic Update on Error ---
      // Restore previous profile state in context
      setProfile(previousProfile);
      // Re-enter edit mode if desired
      // setEditingSections(true); // Optional: uncomment to go back to edit mode
      // -----------------------------------------

      alert('Failed to save changes. Please try again.');

      // Optional: Call refetchProfile() here if needed after error
      // await refetchProfile();
    }
    // No finally block needed here unless adding a loading state for sections
  };

  // Check if any section or bio has been changed from the original
  const hasChangedSections = () => {
    if (!activeProfile) return false;

    return (
      editData.bio !== (activeProfile.bio || '') ||
      editData.section_1st_year !== (activeProfile.section_1st_year || '') ||
      editData.section_2nd_year !== (activeProfile.section_2nd_year || '') ||
      editData.section_3rd_year !== (activeProfile.section_3rd_year || '') ||
      editData.section_4th_year !== (activeProfile.section_4th_year || '')
    );
  };

  // Add these state declarations near the top with other state declarations
  const [childrenList, setChildrenList] = useState<string[]>([])
  const [currentChild, setCurrentChild] = useState('')

  // Add this effect with other useEffect hooks
  const [localPrivacySettings, setLocalPrivacySettings] = useState<Profile['privacy_settings']>(null)
  
  // Initialize local privacy settings from profile
  useEffect(() => {
    if (activeProfile?.privacy_settings) {
      setLocalPrivacySettings(activeProfile.privacy_settings)
    }
  }, [activeProfile?.privacy_settings])

  const updatePrivacySetting = async (field: 'phone' | 'email' | 'address' | 'spouse' | 'children') => {
    if (!activeProfile || !localPrivacySettings) return;
    
    // Update local state immediately
    const newSettings = {
      ...localPrivacySettings,
      [field]: !localPrivacySettings[field]
    };
    
    // Update local state
    setLocalPrivacySettings(newSettings);
    
    // Update local profile without triggering a re-render
    setProfile(currentProfile => 
      currentProfile ? {
        ...currentProfile,
        privacy_settings: newSettings
      } : null
    );
    
    try {
      // Update database in background
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: newSettings })
        .eq('id', activeProfile.id);
      
      if (error) throw error;
      
      // No need to call refetchProfile here
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      
      // Revert local states on error
      setLocalPrivacySettings(activeProfile.privacy_settings);
      setProfile(currentProfile => 
        currentProfile ? {
          ...currentProfile,
          privacy_settings: activeProfile.privacy_settings
        } : null
      );
      
      alert('Failed to update privacy settings');
    }
  };

  // Add back the child management functions
  const addChild = (childName: string) => {
    const trimmedName = childName.trim()
    if (!trimmedName || childrenList.includes(trimmedName)) return
    
    const newList = [...childrenList, trimmedName]
    setChildrenList(newList)
    setCurrentChild('')
  }

  const removeChild = (indexToRemove: number) => {
    const newList = childrenList.filter((_, index) => index !== indexToRemove)
    setChildrenList(newList)
  }

  const handleChildKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentChild.trim()) {
      e.preventDefault()
      addChild(currentChild)
    }
  }

  // Parse children from string or array
  const parseChildren = (childrenValue: string[] | string | null): string[] => {
    if (!childrenValue) return [];
    
    // If it's already an array, just clean it
    if (Array.isArray(childrenValue)) {
      return childrenValue.map(c => c.trim()).filter(c => c !== '');
    }
    
    // If it's a string, split by commas (assuming comma-separated)
    // Adjust the separator if needed (e.g., if it's stored differently)
    return childrenValue.split(',') 
      .map(c => c.trim())
      .filter(c => c !== '');
  };

  const [isProfileLightboxOpen, setIsProfileLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'contact' | 'family' | 'hobbies'>('about')

  // Prepare profile picture slide for lightbox
  const profileSlide = useMemo(() => activeProfile?.profile_picture_url ? [{
    src: activeProfile.profile_picture_url,
    alt: `${fullName}'s profile picture`,
    title: fullName
  }] : [], [activeProfile?.profile_picture_url, fullName])

  if (contextLoading || (viewProfileId && !viewedProfile)) {
    return null // Let the route-level loading.tsx handle the loading state
  }
  
  if (contextError || (viewProfileId && !viewedProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 border border-red-500 text-red-400 px-4 py-3 rounded-md">
          <p>Error loading profile: {contextError || 'Profile not found'}</p>
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
  
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 text-[#7D1A1D]">
      {/* Compact Header Section - Centered */}
      <div className="max-w-3xl mx-auto mb-4 relative pt-20">
        <div className="bg-white bg-opacity-95 border border-[#006633] rounded-lg shadow-md p-4 relative">
          {/* Large Profile Photo - Overflowing Top */}
          <div className="absolute left-8 -top-20 w-40 h-40 flex-shrink-0">
            {activeProfile?.profile_picture_url ? (
              <>
                <div className="absolute inset-0 rounded-full bg-[#C9A335] z-0"></div>
                <div
                  className="absolute inset-[4px] rounded-full overflow-hidden z-10 shadow-xl cursor-pointer border-4 border-white"
                  onClick={() => setIsProfileLightboxOpen(true)}
                >
                  <Image
                    src={activeProfile.profile_picture_url}
                    alt={`${isViewMode ? viewedProfile?.first_name + ' ' + viewedProfile?.last_name : fullName}'s profile picture`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {isOwnProfile && (
                  <div className="absolute z-30 right-0 bottom-0">
                    <button
                      onClick={handleUploadClick}
                      className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-lg"
                      aria-label="Change profile picture"
                    >
                      <Camera size={16} className="text-[#7D1A1D]" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="absolute inset-0 rounded-full bg-[#C9A335] z-0"></div>
                <div className="absolute inset-[4px] rounded-full overflow-hidden z-10 shadow-xl bg-gray-200 flex items-center justify-center border-4 border-white">
                  <span className="text-4xl font-bold text-[#7D1A1D]">{activeProfileInitials}</span>
                </div>
                {isOwnProfile && (
                  <div className="absolute z-30 right-0 bottom-0">
                    <button
                      onClick={handleUploadClick}
                      className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-lg"
                      aria-label="Add profile picture"
                    >
                      <Camera size={16} className="text-[#7D1A1D]" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Alumni Badge Below Picture */}
          <div className="absolute left-8 top-24 w-40 flex justify-center z-40">
            <div className="text-gray-600 text-xs font-medium bg-white px-2 py-0.5 rounded-full border border-gray-300 shadow-sm">Alumni</div>
          </div>

          {/* Name, Sections - Offset for profile picture */}
          <div className="ml-48 min-w-0">
            <h1 className="text-2xl font-bold text-[#7D1A1D] truncate">
              {isViewMode
                ? `${viewedProfile?.first_name} ${viewedProfile?.middle_name ? viewedProfile.middle_name + ' ' : ''}${viewedProfile?.last_name}`
                : nameWithMiddleInitial}
            </h1>

            {/* Sections Badges */}
            <div className="relative">
              {editingSections ? (
                <div className="flex flex-wrap gap-1">
                  <select
                    name="section_1st_year"
                    value={editData.section_1st_year || FIRST_YEAR_SECTIONS[0]}
                    onChange={handleInputChange}
                    className="text-xs border-0 rounded-full px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-green-600"
                  >
                    {FIRST_YEAR_SECTIONS.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  <select
                    name="section_2nd_year"
                    value={editData.section_2nd_year || SECOND_YEAR_SECTIONS[0]}
                    onChange={handleInputChange}
                    className="text-xs border-0 rounded-full px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-amber-500"
                  >
                    {SECOND_YEAR_SECTIONS.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  <select
                    name="section_3rd_year"
                    value={editData.section_3rd_year || THIRD_YEAR_SECTIONS[0]}
                    onChange={handleInputChange}
                    className="text-xs border-0 rounded-full px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-red-600"
                  >
                    {THIRD_YEAR_SECTIONS.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  <select
                    name="section_4th_year"
                    value={editData.section_4th_year || FOURTH_YEAR_SECTIONS[0]}
                    onChange={handleInputChange}
                    className="text-xs border-0 rounded-full px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-blue-600"
                  >
                    {FOURTH_YEAR_SECTIONS.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  <button
                    onClick={hasChangedSections() ? saveSectionChanges : cancelEditingSections}
                    className="text-xs text-gray-500 hover:text-[#7D1A1D] ml-2"
                  >
                    {hasChangedSections() ? "Apply" : "Cancel"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 items-center">
                  {activeProfile?.section_1st_year && (
                    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">{activeProfile.section_1st_year}</span>
                  )}
                  {activeProfile?.section_2nd_year && (
                    <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{activeProfile.section_2nd_year}</span>
                  )}
                  {activeProfile?.section_3rd_year && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{activeProfile.section_3rd_year}</span>
                  )}
                  {activeProfile?.section_4th_year && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{activeProfile.section_4th_year}</span>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={startEditingSections}
                      className="text-xs text-gray-500 hover:text-[#7D1A1D] ml-2"
                    >
                      Edit
                    </button>
                  )}
                  {!activeProfile?.section_1st_year && !activeProfile?.section_2nd_year && !activeProfile?.section_3rd_year && !activeProfile?.section_4th_year && !isOwnProfile && (
                    <span className="text-xs text-transparent">&nbsp;</span>
                  )}
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="mt-3">
              {editingSections ? (
                <div className="relative">
                  <textarea
                    name="bio"
                    value={editData.bio || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded px-3 py-2 resize-none"
                    placeholder="Tell us about yourself..."
                    rows={2}
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-700">
                  {activeProfile?.bio ? (
                    <p className="whitespace-pre-wrap">{activeProfile.bio}</p>
                  ) : (
                    <p className="text-gray-400 italic">
                      {isOwnProfile ? 'Add a bio to tell people about yourself' : '\u00A0'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Sidebar - Tabs + Featured Photos */}
        <div className="lg:col-span-1 space-y-3">
          {/* Tabbed Info Section */}
          <div className="bg-white bg-opacity-95 border border-[#006633] rounded-lg shadow-md overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'bg-[#0B5A28] text-white'
                    : 'text-gray-600 hover:text-[#7D1A1D] hover:bg-gray-50'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-[#0B5A28] text-white'
                    : 'text-gray-600 hover:text-[#7D1A1D] hover:bg-gray-50'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setActiveTab('family')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'family'
                    ? 'bg-[#0B5A28] text-white'
                    : 'text-gray-600 hover:text-[#7D1A1D] hover:bg-gray-50'
                }`}
              >
                Family
              </button>
              <button
                onClick={() => setActiveTab('hobbies')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'hobbies'
                    ? 'bg-[#0B5A28] text-white'
                    : 'text-gray-600 hover:text-[#7D1A1D] hover:bg-gray-50'
                }`}
              >
                Hobbies
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 relative">
              {/* Edit/Cancel Button */}
              {isOwnProfile && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-1 transition-colors text-xs ${
                      isEditing ? 'text-red-500 hover:text-red-600' : 'text-[#C9A335] hover:text-[#E5BD4F]'
                    }`}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                    {!isEditing && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* Apply Button */}
              {isEditing && isOwnProfile && (
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={handleSaveProfile}
                    className="text-[#C9A335] hover:text-[#E5BD4F] transition-colors flex items-center text-xs"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Full name</p>
                      <div className="flex items-center">
                        <FaIdCard className="h-4 w-4 text-gray-600 mr-2" />
                        <p className="font-medium text-sm text-gray-800">
                          {isViewMode
                            ? `${viewedProfile?.first_name} ${viewedProfile?.middle_name ? viewedProfile.middle_name + ' ' : ''}${viewedProfile?.last_name}`
                            : nameWithMiddleInitial}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Birthday</p>
                      <div className="flex items-center">
                        <FaBirthdayCake className="h-4 w-4 text-gray-600 mr-2" />
                        <p className="font-medium text-sm text-gray-800">{formatDate(activeProfile?.birthday)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Profession</p>
                      <div className="flex items-center">
                        <FaBriefcase className="h-4 w-4 text-gray-600 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="profession"
                            value={editData.profession || ''}
                            onChange={handleInputChange}
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded px-2 py-1"
                            placeholder="Your profession"
                          />
                        ) : (
                          <p className="font-medium text-sm">{activeProfile?.profession ? <span className="text-gray-800">{activeProfile.profession}</span> : <span className="text-gray-500">Not provided</span>}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Company</p>
                      <div className="flex items-center">
                        <FaBuilding className="h-4 w-4 text-gray-600 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="company"
                            value={editData.company || ''}
                            onChange={handleInputChange}
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded px-2 py-1"
                            placeholder="Your company"
                          />
                        ) : (
                          <p className="font-medium text-sm">{activeProfile?.company ? <span className="text-gray-800">{activeProfile.company}</span> : <span className="text-gray-500">Not provided</span>}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                        Phone
                        {!isEditing && isOwnProfile && (
                          <button
                            onClick={() => updatePrivacySetting('phone')}
                            className="flex items-center gap-1 text-[10px]"
                            title={localPrivacySettings?.phone ? "Click to make private" : "Click to make public"}
                          >
                            <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.phone ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                              <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.phone ? 'translate-x-3' : ''}`} />
                            </div>
                            <span className={localPrivacySettings?.phone ? 'text-[#C9A335]' : 'text-green-600'}>
                              {localPrivacySettings?.phone ? "Public" : "Private"}
                            </span>
                          </button>
                        )}
                      </p>
                      <div className="flex items-center">
                        <FaPhone className="h-4 w-4 text-gray-600 mr-2" />
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone_number"
                            value={editData.phone_number || ''}
                            onChange={handleInputChange}
                            pattern="[0-9]*"
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded px-2 py-1"
                            placeholder="Your phone number"
                          />
                        ) : (
                          <p className="font-medium text-sm">
                            {(!isOwnProfile && !localPrivacySettings?.phone)
                              ? <span className="text-gray-500">Private</span>
                              : activeProfile?.phone_number
                                ? <span className="text-gray-800">{activeProfile.phone_number}</span>
                                : <span className="text-gray-500">Not provided</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                        Email
                        {!isEditing && isOwnProfile && (
                          <button
                            onClick={() => updatePrivacySetting('email')}
                            className="flex items-center gap-1 text-[10px]"
                            title={localPrivacySettings?.email ? "Click to make private" : "Click to make public"}
                          >
                            <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.email ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                              <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.email ? 'translate-x-3' : ''}`} />
                            </div>
                            <span className={localPrivacySettings?.email ? 'text-[#C9A335]' : 'text-green-600'}>
                              {localPrivacySettings?.email ? "Public" : "Private"}
                            </span>
                          </button>
                        )}
                      </p>
                      <div className="flex items-start">
                        <IoIosMail className="h-4 w-4 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={editData.email || ''}
                              onChange={handleInputChange}
                              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded px-2 py-1"
                              placeholder="Your email address"
                            />
                          ) : (
                            <p className="font-medium break-all text-sm">
                              {(!isOwnProfile && !localPrivacySettings?.email)
                                ? <span className="text-gray-500">Private</span>
                                : activeProfile?.email
                                  ? <span className="text-gray-800">{activeProfile.email}</span>
                                  : <span className="text-gray-500">Not provided</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                        Address
                        {!isEditing && isOwnProfile && (
                          <button
                            onClick={() => updatePrivacySetting('address')}
                            className="flex items-center gap-1 text-[10px]"
                            title={localPrivacySettings?.address ? "Click to make private" : "Click to make public"}
                          >
                            <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.address ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                              <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.address ? 'translate-x-3' : ''}`} />
                            </div>
                            <span className={localPrivacySettings?.address ? 'text-[#C9A335]' : 'text-green-600'}>
                              {localPrivacySettings?.address ? "Public" : "Private"}
                            </span>
                          </button>
                        )}
                      </p>
                      <div className="flex items-start">
                        <FaLocationDot className="h-4 w-4 text-gray-600 mr-2 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          {isEditing ? (
                            <AddressInput
                              value={editData.address}
                              onChange={(value) => setEditData(prev => ({ ...prev, address: value }))}
                              isEditing={isEditing}
                              className="w-full"
                            />
                          ) : (
                            <div className="font-medium text-sm break-words">
                              {(!isOwnProfile && !localPrivacySettings?.address)
                                ? <span className="text-gray-500">Private</span>
                                : activeProfile?.address
                                  ? <span className="text-gray-800">{activeProfile.address}</span>
                                  : <span className="text-gray-500">Not provided</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Family Tab */}
                {activeTab === 'family' && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                        Spouse
                        {!isEditing && isOwnProfile && (
                          <button
                            onClick={() => updatePrivacySetting('spouse')}
                            className="flex items-center gap-1 text-[10px]"
                            title={localPrivacySettings?.spouse ? "Click to make private" : "Click to make public"}
                          >
                            <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.spouse ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                              <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.spouse ? 'translate-x-3' : ''}`} />
                            </div>
                            <span className={localPrivacySettings?.spouse ? 'text-[#C9A335]' : 'text-green-600'}>
                              {localPrivacySettings?.spouse ? "Public" : "Private"}
                            </span>
                          </button>
                        )}
                      </p>
                      <div className="flex items-center">
                        <GiBigDiamondRing className="h-4 w-4 text-gray-600 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="spouse_name"
                            value={editData.spouse_name || ''}
                            onChange={handleInputChange}
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded px-2 py-1"
                            placeholder="Spouse's name"
                          />
                        ) : (
                          <p className="font-medium text-sm">
                            {(!isOwnProfile && !localPrivacySettings?.spouse)
                              ? <span className="text-gray-500">Private</span>
                              : activeProfile?.spouse_name
                                ? <span className="text-gray-800">{activeProfile.spouse_name}</span>
                                : <span className="text-gray-500">Not provided</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2">
                        Children
                        {!isEditing && isOwnProfile && (
                          <button
                            onClick={() => updatePrivacySetting('children')}
                            className="flex items-center gap-1 text-[10px]"
                            title={localPrivacySettings?.children ? "Click to make private" : "Click to make public"}
                          >
                            <div className={`w-6 h-3 rounded-full transition-colors ${localPrivacySettings?.children ? 'bg-[#C9A335]' : 'bg-green-600'} relative`}>
                              <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${localPrivacySettings?.children ? 'translate-x-3' : ''}`} />
                            </div>
                            <span className={localPrivacySettings?.children ? 'text-[#C9A335]' : 'text-green-600'}>
                              {localPrivacySettings?.children ? "Public" : "Private"}
                            </span>
                          </button>
                        )}
                      </p>
                      <div className="flex items-start">
                        <FaChildren className="h-4 w-4 text-gray-600 mr-2 flex-shrink-0 mt-1" />
                        {isEditing ? (
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {childrenList.map((child, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded border border-gray-400 flex items-center"
                                >
                                  {child}
                                  <button
                                    onClick={() => removeChild(index)}
                                    className="ml-1 text-gray-500 hover:text-gray-700"
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
                                onKeyDown={handleChildKeyDown}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded px-2 py-1 pr-16"
                                placeholder="Add child's name"
                              />
                              {currentChild.trim() && (
                                <button
                                  onClick={() => addChild(currentChild)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#006633] hover:text-[#005528] transition-colors font-medium text-xs"
                                  type="button"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="font-medium text-sm">
                            {(!isOwnProfile && !localPrivacySettings?.children)
                              ? <span className="text-gray-500">Private</span>
                              : (activeProfile?.children)
                                ? <span className="text-gray-800">
                                    {typeof activeProfile.children === 'string'
                                      ? activeProfile.children
                                      : (activeProfile.children as string[]).join(', ')}
                                  </span>
                                : <span className="text-gray-500">Not provided</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Hobbies Tab */}
                {activeTab === 'hobbies' && (
                  <div>
                    <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-2">Hobbies & interests</p>
                    <div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(isViewMode ? parseHobbies(viewedProfile?.hobbies_interests || null) : selectedHobbies).map((hobby) => {
                          const category = getHobbyCategory(hobby);
                          return (
                            <span
                              key={hobby}
                              className={`${HOBBY_CATEGORIES[category].color} text-white text-xs px-2 py-0.5 rounded-full flex items-center`}
                            >
                              {hobby}
                              {isEditing && (
                                <button
                                  onClick={() => removeHobby(hobby)}
                                  className="ml-1 text-white/80 hover:text-white"
                                  type="button"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>

                      {isEditing && (
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={currentHobby}
                            onChange={handleHobbyInputChange}
                            onKeyDown={handleHobbyKeyDown}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded px-2 py-1"
                            placeholder="Add a hobby then Enter"
                          />
                          {showSuggestions && filteredSuggestions.length > 0 && (
                            <div
                              ref={suggestionsRef}
                              className="absolute z-10 mt-1 w-full max-h-28 overflow-y-auto bg-white rounded shadow-md border border-gray-300"
                            >
                              {filteredSuggestions.map((hobby) => (
                                <button
                                  key={hobby}
                                  onClick={() => addHobby(hobby)}
                                  className="text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 w-full"
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
                )}
              </div>
            </div>
          </div>

          {/* Featured Photos Section */}
          {activeProfile && (
            <div className="bg-white bg-opacity-95 border border-[#006633] rounded-lg shadow-md overflow-hidden">
              <FeaturedPhotos
                userId={activeProfile.id}
                userFolderName={fullName.replace(/\s+/g, '_') || activeProfile.id}
                isOwnProfile={isOwnProfile}
                onComplete={refetchProfile}
              />
            </div>
          )}
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white bg-opacity-95 border border-[#006633] rounded-lg shadow-md overflow-hidden">
            {/* Post Creator */}
            {isOwnProfile && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex gap-3">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    {activeProfile?.profile_picture_url ? (
                      <>
                        <div className="absolute inset-0 rounded-full bg-[#C9A335] z-0"></div>
                        <div className="absolute inset-[2px] rounded-full overflow-hidden z-10">
                          <Image
                            src={activeProfile.profile_picture_url}
                            alt="Your profile"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 rounded-full bg-[#C9A335] z-0"></div>
                        <div className="absolute inset-[2px] rounded-full overflow-hidden z-10 bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#7D1A1D]">{activeProfileInitials}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Share your thoughts with fellow alumni..."
                      className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B5A28] border-0"
                      rows={3}
                      disabled
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        disabled
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Photo/Video
                      </button>
                      <button
                        disabled
                        className="ml-auto px-4 py-1.5 text-sm font-medium rounded-md bg-gray-200 text-gray-500 cursor-not-allowed"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Posts Placeholder */}
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Timeline Coming Soon</p>
              <p className="text-gray-400 text-sm mt-1">Share updates, photos, and memories with fellow alumni</p>
            </div>
          </div>
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
    </div>
  )
}

// Update the main ProfilePage component
export default function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [resolvedParams, setResolvedParams] = useState<{ id?: string } | null>(null)
  const supabase = createClient()
  
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Resolve params if they exist
        const resolvedParamsData = params ? await params : null
        setResolvedParams(resolvedParamsData)
        
        // Get user session
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
      } catch (error) {
        console.error('Error initializing component:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeComponent()
  }, [params])
  
  if (isLoading) {
    return null // Let the route-level loading.tsx handle the loading state
  }
  
  if (!session) {
    return <LoginPage />
  }
  
  return (
    <ProfileProvider user={session.user}>
      <ProfileContent viewProfileId={resolvedParams?.id} />
    </ProfileProvider>
  )
} 
