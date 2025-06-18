'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileContext } from '@/contexts/ProfileContext'
import { createClient } from '@/utils/supabase/client'
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

import { ProfileContent } from '@/components/ProfileContent'


export default function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Resolve params if they exist
        const resolvedParamsData = params ? await params : null
        setResolvedParams(resolvedParamsData)
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
  
  return <ProfileContent viewProfileId={resolvedParams?.id} />
} 
