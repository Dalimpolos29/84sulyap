'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X } from 'lucide-react'

interface WelcomeHeroProps {
  userName: string
}

export default function WelcomeHero({ userName }: WelcomeHeroProps) {
  const [show, setShow] = useState(true)
  const [photos, setPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [fade, setFade] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadRandomPhotos()

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (photos.length === 0) return

    // Change photo every 1.5 seconds
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
        setFade(true)
      }, 300)
    }, 1500)

    return () => clearInterval(interval)
  }, [photos])

  const loadRandomPhotos = async () => {
    try {
      // Fetch random photos from gallery
      const { data, error } = await supabase
        .from('photos')
        .select('image_url')
        .limit(10)

      if (error) throw error

      if (data && data.length > 0) {
        // Shuffle and pick 5 random photos
        const shuffled = data.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, 5).map(p => p.image_url)
        setPhotos(selected)
      } else {
        // Fallback to placeholder if no photos
        setPhotos([
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
          'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200'
        ])
      }
    } catch (error) {
      console.error('Error loading photos:', error)
      // Use fallback
      setPhotos([
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200'
      ])
    }
  }

  const handleClose = () => {
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-fadeIn">
      {/* Background Photo Slideshow */}
      <div className="absolute inset-0 overflow-hidden">
        {photos.length > 0 && (
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              fade ? 'opacity-40' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${photos[currentPhotoIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10"
      >
        <X className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Welcome Content */}
      <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl animate-slideUp">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-12 shadow-2xl border border-white/20">
          {/* Logo or Icon */}
          <div className="mb-6 md:mb-8">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-[#7D1A1D] rounded-full flex items-center justify-center shadow-xl">
              <span className="text-2xl md:text-4xl font-bold text-white font-serif">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Welcome Message */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-3 md:mb-4 font-serif drop-shadow-lg">
            Welcome Back,
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#C9A335] mb-4 md:mb-6 font-serif drop-shadow-lg">
            {userName}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 font-serif drop-shadow-md">
            UPIS Batch '84 Alumni Portal
          </p>
          <p className="text-sm sm:text-base md:text-lg text-white/70 mt-2 font-serif">
            Reconnecting Our Past, Empowering Our Future
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out 0.3s both;
        }
      `}</style>
    </div>
  )
}
