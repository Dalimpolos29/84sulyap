'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useProfileContext, ProfileProvider } from '@/contexts/ProfileContext'
import Link from 'next/link'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import ImageCropper from '@/components/ImageCropper'
import FeaturedPhotos from '@/components/FeaturedPhotos'
import { FaIdCard, FaBriefcase, FaPhone, FaChildren, FaLocationDot, FaBuilding } from "react-icons/fa6";
import { FaBirthdayCake } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { GiBigDiamondRing } from "react-icons/gi";
import AddressInput from '@/components/ui/AddressInput'
import { useProfile, Profile } from '@/hooks/useProfile'
import Header from '@/components/layout/Header' // Import Header
import Footer from '@/components/layout/Footer' // Import Footer

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

// Profile content component
function ProfileContent() {
  const router = useRouter()
  const { profile, loading, error, fullName, displayName, nameWithMiddleInitial, initials, refetchProfile, setProfile } = useProfileContext()
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSections, setEditingSections] = useState(false)
  const [editData, setEditData] = useState({
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
  
  // Update editData when profile changes
  useEffect(() => {
    if (profile) {
      setEditData({
        profession: profile.profession || '',
        company: profile.company || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
        spouse_name: profile.spouse_name || '',
        children: profile.children || '',
        hobbies_interests: profile.hobbies_interests || '',
        section_1st_year: profile.section_1st_year || '',
        section_2nd_year: profile.section_2nd_year || '',
        section_3rd_year: profile.section_3rd_year || '',
        section_4th_year: profile.section_4th_year || '',
        address: profile.address || ''
      });
      
      // Parse hobbies from the hobbies_interests field
      setSelectedHobbies(parseHobbies(profile.hobbies_interests));
      // Parse children from the children field (assuming it might be a string or array)
      setChildrenList(parseChildren(profile.children));
    }
  }, [profile]);
  
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
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle save profile
  const handleSaveProfile = async () => {
    if (!profile) return

    // Store the previous profile state in case we need to revert on error
    const previousProfile = profile;

    try {
      setIsSaving(true)

      const formattedHobbies = formatHobbies(selectedHobbies);

      const updatedData = {
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
      // 1. Update local context immediately
      // Format arrays back to strings *only* for the local context update 
      // to match the potentially outdated Profile type definition.
      // The database update will still use the correct array format.
      const updatedDataForContext = {
        ...updatedData,
        hobbies_interests: formattedHobbies.join('; '), // Format hobbies back to string
        children: childrenList.join(', '),           // Format children back to string
      };
      setProfile(currentProfile => 
        currentProfile ? { ...currentProfile, ...updatedDataForContext } : null
      );
      // 2. Exit edit mode immediately for instant UI feedback
      setIsEditing(false);
      // -------------------------

      // 3. Update database in the background
      const { error: updateError, status } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', profile.id)
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
    if (profile) {
      setEditData({
        profession: profile.profession || '',
        company: profile.company || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
        spouse_name: profile.spouse_name || '',
        children: profile.children || '',
        hobbies_interests: profile.hobbies_interests || '',
        section_1st_year: profile.section_1st_year || '',
        section_2nd_year: profile.section_2nd_year || '',
        section_3rd_year: profile.section_3rd_year || '',
        section_4th_year: profile.section_4th_year || '',
        address: profile.address || ''
      })
    }
    setIsEditing(false)
  }
  
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

  // Section-specific functions
  const startEditingSections = () => {
    setEditingSections(true);
  };

  const cancelEditingSections = () => {
    // Reset section values to original
    if (profile) {
      setEditData(prev => ({
        ...prev,
        section_1st_year: profile.section_1st_year || '',
        section_2nd_year: profile.section_2nd_year || '',
        section_3rd_year: profile.section_3rd_year || '',
        section_4th_year: profile.section_4th_year || ''
      }));
    }
    setEditingSections(false);
  };

  const saveSectionChanges = async () => {
    if (!profile) return;

    // Store previous state for potential revert
    const previousProfile = profile;
    
    try {
      // Prepare section update data
      const updatedData = {
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
        .eq('id', profile.id);
        
      if (error) {
        throw error;
      }
      
      console.log('Section changes updated successfully in database.');
      
      // 4. Remove full refetch on success
      // await refetchProfile();

    } catch (error: any) {
      console.error('Error saving section changes - reverting UI:', error);
      
      // --- Revert Optimistic Update on Error ---
      // Restore previous profile state in context
      setProfile(previousProfile);
      // Re-enter edit mode if desired
      // setEditingSections(true); // Optional: uncomment to go back to edit mode
      // -----------------------------------------

      alert('Failed to save section changes. Please try again.');
      
      // Optional: Call refetchProfile() here if needed after error
      // await refetchProfile();
    } 
    // No finally block needed here unless adding a loading state for sections
  };

  // Check if any section has been changed from the original
  const hasChangedSections = () => {
    if (!profile) return false;
    
    return (
      editData.section_1st_year !== (profile.section_1st_year || '') ||
      editData.section_2nd_year !== (profile.section_2nd_year || '') ||
      editData.section_3rd_year !== (profile.section_3rd_year || '') ||
      editData.section_4th_year !== (profile.section_4th_year || '')
    );
  };

  // Add these state declarations near the top with other state declarations
  const [childrenList, setChildrenList] = useState<string[]>([])
  const [currentChild, setCurrentChild] = useState('')

  // Add this effect with other useEffect hooks
  const [localPrivacySettings, setLocalPrivacySettings] = useState<Profile['privacy_settings']>(null)
  
  // Initialize local privacy settings from profile
  useEffect(() => {
    if (profile?.privacy_settings) {
      setLocalPrivacySettings(profile.privacy_settings)
    }
  }, [profile?.privacy_settings])

  const updatePrivacySetting = async (field: 'phone' | 'email' | 'address' | 'spouse' | 'children') => {
    if (!profile || !localPrivacySettings) return;
    
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
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // No need to call refetchProfile here
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      
      // Revert local states on error
      setLocalPrivacySettings(profile.privacy_settings);
      setProfile(currentProfile => 
        currentProfile ? {
          ...currentProfile,
          privacy_settings: profile.privacy_settings
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
    <div 
      className="min-h-screen flex flex-col text-[#7D1A1D]"
      style={{
        backgroundColor: "#E5DFD0",
        backgroundImage:
          "radial-gradient(#7D1A1D 0.5px, transparent 0.5px), radial-gradient(#C9A335 0.5px, #E5DFD0 0.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
        backgroundAttachment: "fixed",
      }}
    >
      <Header />
      
      {/* Main Profile Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Profile Card */}
          <div className="bg-white bg-opacity-95 border-2 border-[#006633] rounded-lg shadow-md p-6 pb-3 sm:pb-6 flex flex-col items-center col-span-12 md:col-span-5 h-fit relative"> {/* Changed background back to white, added shadow */} 
            <h2 className="text-3xl font-bold text-center mb-1 text-[#7D1A1D]">{displayName}</h2>
            <div className="text-gray-600 text-sm font-medium mb-3">Alumni</div>
            
            <div className="w-full max-w-[98%] md:max-w-[90%] lg:max-w-[98%] mx-auto mb-3">
              {/* Profile picture or initials */}
                  {profile.profile_picture_url ? (
                <div className="aspect-square w-full relative">
                  {/* Outer circle frame with gold color */}
                  <div className="absolute inset-0 rounded-full bg-[#C9A335] z-0"></div>
                  
                  {/* Image with shadow on top */}
                  <div className="absolute inset-[22px] rounded-full overflow-hidden z-10 shadow-[0_8px_24px_rgba(0,0,0,0.7)]">
                <Image
                        src={profile.profile_picture_url}
                        alt={`${fullName}'s profile picture`}
                      fill
                      className="object-cover"
                  priority
                />
          </div>
          
                  {/* Camera icon positioned to always be at the same position relative to the circle border */}
                      {isOwnProfile && (
                    <div className="absolute z-30" style={{ right: '8%', bottom: '11%', transform: 'translate(0%, 0%)' }}>
          <button 
                          onClick={handleUploadClick}
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-lg"
                          aria-label="Change profile picture"
          >
                        <Camera size={20} className="text-[#7D1A1D]" />
          </button>
        </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square w-full relative">
                  {/* Outer circle frame with gold color */}
                  <div className="absolute inset-0 rounded-full bg-[#C9A335] z-0"></div>
                  
                  {/* Initials with shadow on top */}
                  <div className="absolute inset-[22px] rounded-full overflow-hidden z-10 shadow-[0_8px_24px_rgba(0,0,0,0.7)] bg-gray-200 flex items-center justify-center">
                    <span className="text-7xl font-bold text-[#7D1A1D]">{initials}</span>
            </div>
            
                  {/* Camera icon positioned to always be at the same position relative to the circle border */}
                      {isOwnProfile && (
                    <div className="absolute z-30" style={{ right: '8%', bottom: '11%', transform: 'translate(0%, 0%)' }}>
                        <button 
                          onClick={handleUploadClick}
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-lg"
                          aria-label="Add profile picture"
                        >
                        <Camera size={20} className="text-[#7D1A1D]" />
                        </button>
                    </div>
                      )}
                </div>
                  )}
                </div>
            
            {/* Display sections below profile picture */}
            <div className="text-center mb-4 mt-2 relative">
              {editingSections ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="flex items-center">
                    <select
                      name="section_1st_year"
                      value={editData.section_1st_year || FIRST_YEAR_SECTIONS[0]}
                      onChange={handleInputChange}
                      className="bg-[#333333] text-xs border-0 rounded-full px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-green-600"
                    >
                      {FIRST_YEAR_SECTIONS.map((section) => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <select
                      name="section_2nd_year"
                      value={editData.section_2nd_year || SECOND_YEAR_SECTIONS[0]}
                      onChange={handleInputChange}
                      className="bg-[#333333] text-xs border-0 rounded-full px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-amber-500"
                    >
                      {SECOND_YEAR_SECTIONS.map((section) => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <select
                      name="section_3rd_year"
                      value={editData.section_3rd_year || THIRD_YEAR_SECTIONS[0]}
                      onChange={handleInputChange}
                      className="bg-[#333333] text-xs border-0 rounded-full px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-red-600"
                    >
                      {THIRD_YEAR_SECTIONS.map((section) => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <select
                      name="section_4th_year"
                      value={editData.section_4th_year || FOURTH_YEAR_SECTIONS[0]}
                      onChange={handleInputChange}
                      className="bg-[#333333] text-xs border-0 rounded-full px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A335] bg-blue-600"
                    >
                      {FOURTH_YEAR_SECTIONS.map((section) => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {profile.section_1st_year ? (
                    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {profile.section_1st_year}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                  
                  {profile.section_2nd_year ? (
                    <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {profile.section_2nd_year}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                  
                  {profile.section_3rd_year ? (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {profile.section_3rd_year}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                  
                  {profile.section_4th_year ? (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {profile.section_4th_year}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Edit Sections button - Moved to be relative to the card */}
            {isOwnProfile && !editingSections && (
              <button 
                onClick={startEditingSections}
                className="absolute bottom-3 right-6 text-gray-500 hover:text-[#7D1A1D] transition-colors flex items-center text-xs"
                aria-label="Edit sections"
              >
                <span className="mr-1">Edit Sections</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
            
            {isOwnProfile && editingSections && (
              <button 
                onClick={hasChangedSections() ? saveSectionChanges : cancelEditingSections}
                className="absolute bottom-3 right-6 text-gray-500 hover:text-[#7D1A1D] transition-colors flex items-center text-xs"
                aria-label={hasChangedSections() ? "Apply section changes" : "Cancel editing sections"}
              >
                {hasChangedSections() ? (
                  <>
                    <span className="mr-1">Apply</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    </>
                  ) : (
                    <>
                    <span className="mr-1">Cancel</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            )}
                      </div>
              
          {/* Bio & Details Card */}
          <div className="bg-white bg-opacity-95 border-2 border-[#006633] rounded-lg shadow-md p-6 col-span-12 md:col-span-7 relative"> {/* Changed background back to white, added shadow */} 
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between text-[#7D1A1D]">
              {isOwnProfile ? "Personal Information" : "User Information"}
                      {isOwnProfile && (
                        <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[#C9A335] hover:text-[#E5BD4F] transition-colors"
                  aria-label={isEditing ? "Cancel editing" : "Edit information"}
                  disabled={isSaving}
                >
                  {isEditing ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                  )}
                        </button>
                      )}
            </h2>
            
            {isEditing ? (
              /* Edit Mode - Same layout as view mode */
              <div className="space-y-5">
                <div className="p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    {/* Row 1: Full Name | Birthday */}
                      <div>
                      <p className="text-xs text-gray-400 font-['Roboto'] capitalize tracking-wide mb-1">Full name</p>
                      <div className="flex items-center">
                        <FaIdCard className="h-5 w-5 text-gray-600 mr-3" />
                        <p className="font-medium break-words text-gray-800">{nameWithMiddleInitial}</p> {/* Added text-gray-800 */}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 font-['Roboto'] capitalize tracking-wide mb-1">Birthday</p>
                      <div className="flex items-center">
                        <FaBirthdayCake className="h-5 w-5 text-gray-600 mr-3" />
                        <p className="font-medium break-words text-gray-800">{formatDate(profile.birthday)}</p> {/* Added text-gray-800 */}
                      </div>
                    </div>
                    
                    {/* Row 2: Profession | Company */}
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Profession</p> {/* Changed label color */} 
                      <div className="flex items-center">
                        <FaBriefcase className="h-5 w-5 text-gray-600 mr-3" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="profession"
                            value={editData.profession || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                            placeholder="Your profession"
                          />
                        ) : (
                          <p className="font-medium break-words text-gray-500">{profile.profession || 'Not provided'}</p>
                  )}
                </div>
              </div>
              
                      <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Company</p> {/* Changed label color */} 
                      <div className="flex items-center">
                        <FaBuilding className="h-5 w-5 text-gray-600 mr-3" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="company"
                            value={editData.company || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                            placeholder="Your company"
                          />
                        ) : (
                          <p className="font-medium break-words text-gray-500">{profile.company || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  
                    {/* Separator */}
                    <div className="sm:col-span-2 mt-0 mb-0">
                      <div className="border-t border-gray-200"></div> {/* Changed from border-gray-700 */}
                   </div>
                  
                    {/* Row 3: Phone | Email */}
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <FaPhone className="h-5 w-5 text-gray-600 mr-3" />
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
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                            placeholder="Your phone number"
                          />
                        ) : (
                          <p className="font-medium break-words text-gray-500">
                            {(!isOwnProfile && !localPrivacySettings?.phone) 
                              ? "Private" 
                              : (profile?.phone_number || 'Not provided')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                      <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <IoIosMail className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={editData.email || ''}
                              onChange={handleInputChange}
                              className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                              placeholder="Your email address"
                            />
                          ) : (
                            <p className="font-medium break-all text-sm sm:text-base text-gray-500">
                              {(!isOwnProfile && !localPrivacySettings?.email) 
                                ? "Private" 
                                : (profile?.email || 'Not provided')}
                            </p>
                          )}
                    </div>
                      </div>
                    </div>
                    
                    {/* Row 4: Address */}
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <FaLocationDot className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          {isEditing ? (
                            <AddressInput
                              value={editData.address}
                              onChange={(value) => setEditData(prev => ({ ...prev, address: value }))}
                              isEditing={isEditing}
                              className="w-full" // AddressInput handles its own styles based on isEditing
                              // Pass light theme specific styles if needed via props, e.g., inputClassName="bg-gray-50 ..."
                            />
                          ) : (
                            <div className="font-medium break-words text-gray-500">
                              {(!isOwnProfile && !localPrivacySettings?.address) 
                                ? "Private" 
                                : (profile?.address || 'Not provided')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Separator */}
                    <div className="sm:col-span-2 mt-0 mb-0">
                      <div className="border-t border-gray-700"></div>
                    </div>
                    
                    {/* Row 5: Spouse | Children */}
                      <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <GiBigDiamondRing className="h-5 w-5 text-gray-600 mr-3" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="spouse_name"
                            value={editData.spouse_name || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                            placeholder="Spouse's name"
                          />
                        ) : (
                          <p className="font-medium break-words text-gray-500">
                            {(!isOwnProfile && !localPrivacySettings?.spouse) 
                              ? "Private" 
                              : (profile?.spouse_name || 'Not provided')}
                          </p>
                        )}
                    </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <FaChildren className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                        {isEditing ? (
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-1 items-center">
                              {childrenList.map((child, index) => (
                                <span 
                                  key={index}
                                  className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded border border-gray-400 flex items-center" // Light theme badge
                                >
                                  {child}
                                  <button 
                                    onClick={() => removeChild(index)}
                                    className="ml-1 text-gray-600 hover:text-gray-800" // Light theme remove button
                                    type="button"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              <input
                                type="text"
                                value={currentChild}
                                onChange={(e) => setCurrentChild(e.target.value)}
                                onKeyDown={handleChildKeyDown}
                                className="bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium w-full placeholder-gray-400" // Removed px-2 py-1
                                placeholder="Add child's name and press Enter"
                              />
                </div>
              </div>
                        ) : (
                          <p className="font-medium break-words"> {/* Removed text-gray-500 */}
                            {(!isOwnProfile && !localPrivacySettings?.children) 
                              ? <span className="text-gray-500">Private</span> // Added span for color
                              : (profile?.children && Array.isArray(profile.children) && profile.children.length > 0)
                                ? <span className="text-gray-800">{profile.children.join(', ')}</span> // Display joined array if exists
                                : <span className="text-gray-500">Not provided</span> // Otherwise show Not provided
                            }
                          </p>
                        )}
            </div>
          </div>
          
                    {/* Separator */}
                    <div className="sm:col-span-2 mt-0 mb-0">
                      <div className="border-t border-gray-700"></div>
              </div>
                    
                    {/* Row 6: Hobbies & Interests (spanning both columns) */}
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Hobbies & interests</p> {/* Changed label color */} 
                      <div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedHobbies.map((hobby) => {
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
                          <div className="relative">
                            <input
                              type="text"
                              value={currentHobby}
                              onChange={handleHobbyInputChange}
                              onKeyDown={handleHobbyKeyDown}
                              className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                              placeholder="Add a hobby and press Enter"
                            />
                            {showSuggestions && filteredSuggestions.length > 0 && (
                              <div 
                                ref={suggestionsRef} 
                                className="absolute z-10 mt-1 w-full max-h-28 overflow-y-auto bg-[#1E1E1E] rounded shadow-md border border-gray-700"
                              >
                                {filteredSuggestions.map((hobby) => (
                                  <button
                                    key={hobby}
                                    onClick={() => addHobby(hobby)}
                                    className="text-left text-sm text-gray-300 hover:bg-[#333333] px-2 py-1 w-full"
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
            ) : (
              /* View Mode - Original Content */
              <div className="space-y-5">
                <div className="p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    {/* Row 1: Full Name | Birthday */}
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Full name</p>
                      <div className="flex items-center">
                        <FaIdCard className="h-5 w-5 text-gray-600 mr-3" />
                        <p className="font-medium break-words text-gray-800">{nameWithMiddleInitial}</p>
            </div>
          </div>
          
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Birthday</p>
                      <div className="flex items-center">
                        <FaBirthdayCake className="h-5 w-5 text-gray-600 mr-3" />
                        <p className="font-medium break-words text-gray-800">{formatDate(profile.birthday)}</p>
              </div>
              </div>
                    
                    {/* Row 2: Profession | Company */}
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Profession</p> {/* Changed label color */} 
                      <div className="flex items-center">
                        <FaBriefcase className="h-5 w-5 text-gray-600 mr-3" />
                        <p className="font-medium break-words">{profile.profession ? <span className="text-gray-800">{profile.profession}</span> : <span className="text-gray-500">Not provided</span>}</p>
              </div>
            </div>
            
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Company</p> {/* Changed label color */} 
                      <div className="flex items-center">
                        <FaBuilding className="h-5 w-5 text-gray-600 mr-3" />
                        <p className="font-medium break-words">{profile.company ? <span className="text-gray-800">{profile.company}</span> : <span className="text-gray-500">Not provided</span>}</p>
              </div>
              </div>
                  
                    {/* Separator */}
                    <div className="sm:col-span-2 mt-0 mb-0">
                      <div className="border-t border-gray-200"></div>
          </div>
          
                    {/* Row 3: Phone | Email */}
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <FaPhone className="h-5 w-5 text-gray-600 mr-3" />
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
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                            placeholder="Your phone number"
                          />
                        ) : (
                          <p className="font-medium break-words text-gray-500">
                            {(!isOwnProfile && !localPrivacySettings?.phone) 
                              ? "Private" 
                              : profile?.phone_number 
                                ? <span className="text-gray-800">{profile.phone_number}</span>
                                : <span className="text-gray-500">Not provided</span>}
                          </p>
                        )}
            </div>
          </div>
          
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <IoIosMail className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={editData.email || ''}
                              onChange={handleInputChange}
                              className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                              placeholder="Your email address"
                            />
                          ) : (
                            <p className="font-medium break-all text-sm sm:text-base text-gray-500">
                              {(!isOwnProfile && !localPrivacySettings?.email) 
                                ? "Private" 
                                : profile?.email 
                                  ? <span className="text-gray-800">{profile.email}</span>
                                  : <span className="text-gray-500">Not provided</span>}
                            </p>
                          )}
          </div>
            </div>
          </div>
          
                    {/* Row 4: Address */}
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <FaLocationDot className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          {/* AddressInput handles its own view/edit state styling */} 
                          <AddressInput
                            value={profile.address}
                            onChange={(value) => setEditData(prev => ({ ...prev, address: value }))}
                            isEditing={isEditing}
                            className="w-full" // Removed viewClassName, className applies base styles
                          />
            </div>
            </div>
          </div>

                    {/* Separator */}
                    <div className="sm:col-span-2 mt-0 mb-0">
                      <div className="border-t border-gray-200"></div>
                    </div>
                    
                    {/* Row 5: Spouse | Children */}
                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <GiBigDiamondRing className="h-5 w-5 text-gray-600 mr-3" />
                        {isEditing ? (
      <input 
                            type="text"
                            name="spouse_name"
                            value={editData.spouse_name || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400" // Removed px-2 py-1
                            placeholder="Spouse's name"
                          />
                        ) : (
                          <p className="font-medium break-words text-gray-500">
                            {(!isOwnProfile && !localPrivacySettings?.spouse) 
                              ? "Private" 
                              : profile?.spouse_name 
                                ? <span className="text-gray-800">{profile.spouse_name}</span>
                                : <span className="text-gray-500">Not provided</span>}
                          </p>
                        )}
          </div>
        </div>

                    <div>
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1 flex items-center gap-2"> {/* Changed label color */} 
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
                        <FaChildren className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-1" />
                        <p className="font-medium break-words">
                          {(!isOwnProfile && !localPrivacySettings?.children) 
                            ? <span className="text-gray-500">Private</span> 
                            : (profile?.children && Array.isArray(profile.children) && profile.children.length > 0)
                              ? <span className="text-gray-800">{profile.children.join(', ')}</span> // Correctly join the array with comma and space
                              : <span className="text-gray-500">Not provided</span>}
                        </p>
            </div>
          </div>

                    {/* Separator */}
                    <div className="sm:col-span-2 mt-0 mb-0">
                      <div className="border-t border-gray-200"></div>
        </div>
                    
                    {/* Row 6: Hobbies & Interests (spanning both columns) */}
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500 font-['Roboto'] capitalize tracking-wide mb-1">Hobbies & interests</p> {/* Changed label color */} 
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {selectedHobbies.length > 0 ? (
                            selectedHobbies.map((hobby) => {
                              const category = getHobbyCategory(hobby);
                              return (
                                <span 
                                  key={hobby}
                                  className={`${HOBBY_CATEGORIES[category].color} text-white text-xs px-2 py-0.5 rounded-full`}
                                >
                                  {hobby}
                                </span>
                              );
                            })
                          ) : (
                            <p className="font-medium text-gray-500">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Save Button - Floating at bottom */}
            {isEditing && (
            <button
                onClick={handleSaveProfile}
                className="absolute bottom-3 right-6 text-green-500 hover:text-green-400 transition-colors flex items-center text-sm"
                disabled={isSaving}
                aria-label="Save changes"
              >
                {isSaving ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
            </button>
            )}
          </div>
          
          {/* Featured Photos Section */}
          <div className="mt-6 bg-white bg-opacity-95 border-2 border-[#006633] rounded-lg shadow-md overflow-hidden col-span-12"> {/* Changed background back to white, added shadow */} 
            <FeaturedPhotos 
              userId={profile.id} 
              userFolderName={fullName.replace(/\s+/g, '_') || profile.id}
              isOwnProfile={isOwnProfile}
              onComplete={refetchProfile}
            />
          </div>
        </div>
      </main>

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

      <Footer />
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
