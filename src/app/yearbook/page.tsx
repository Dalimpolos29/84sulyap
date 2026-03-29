'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react'

interface YearbookPage {
  id: string
  page_number: number
  cloudinary_url: string
  cloudinary_public_id: string
}

export default function YearbookPage() {
  const [pages, setPages] = useState<YearbookPage[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('yearbook_pages')
        .select('*')
        .order('page_number', { ascending: true })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      console.error('Error fetching yearbook pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToNextPage = () => {
    if (currentPage < 98 && !isFlipping) {
      setIsFlipping(true)
      setFlipDirection('right')
      setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setIsFlipping(false)
        setFlipDirection(null)
        setZoomLevel(1)
        setIsZoomed(false)
      }, 600)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1 && !isFlipping) {
      setIsFlipping(true)
      setFlipDirection('left')
      setTimeout(() => {
        setCurrentPage(prev => prev - 1)
        setIsFlipping(false)
        setFlipDirection(null)
        setZoomLevel(1)
        setIsZoomed(false)
      }, 600)
    }
  }

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => Math.min(prev + 0.5, 3))
      setIsZoomed(true)
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => Math.max(prev - 0.5, 1))
      if (zoomLevel <= 1.5) setIsZoomed(false)
    }
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setIsZoomed(false)
  }

  const currentPageData = pages.find(p => p.page_number === currentPage)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPreviousPage()
      if (e.key === 'ArrowRight') goToNextPage()
      if (e.key === 'Escape') resetZoom()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, isFlipping])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading Digital Sulyap...</p>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No yearbook pages uploaded yet</p>
          <p className="text-gray-400">Contact an administrator to upload pages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Digital Sulyap</h1>
          <p className="text-gray-300">UPIS Batch '84 Yearbook</p>
        </div>

        {/* Main Viewer */}
        <div className="relative">
          {/* Page Container with Book Effect */}
          <div className="relative bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg shadow-2xl p-4 md:p-8">
            {/* Page Number Display */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold z-10">
              Page {currentPage} / 98
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              {isZoomed && (
                <button
                  onClick={resetZoom}
                  className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                  title="Reset Zoom"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Page Image with Flip Animation */}
            <div
              className={`relative w-full aspect-[8.5/11] bg-white rounded shadow-xl overflow-hidden ${
                isZoomed ? 'cursor-move' : 'cursor-default'
              }`}
              style={{
                perspective: '2000px',
              }}
            >
              <div
                className={`w-full h-full transition-transform duration-600 ${
                  isFlipping && flipDirection === 'right' ? 'animate-flip-right' : ''
                } ${
                  isFlipping && flipDirection === 'left' ? 'animate-flip-left' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {currentPageData ? (
                  <div
                    className={`relative w-full h-full ${isZoomed ? 'overflow-auto' : 'overflow-hidden'}`}
                  >
                    <Image
                      src={currentPageData.cloudinary_url}
                      alt={`Page ${currentPage}`}
                      fill
                      className="object-contain"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center',
                        transition: 'transform 0.3s ease',
                      }}
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Page {currentPage} not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || isFlipping}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 p-4 rounded-full shadow-xl transition-all hover:scale-110 disabled:scale-100"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage === 98 || isFlipping}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 p-4 rounded-full shadow-xl transition-all hover:scale-110 disabled:scale-100"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Use arrow keys or click buttons to navigate • Zoom in/out to view details • Press ESC to reset zoom</p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes flip-right {
          0% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          50% {
            transform: rotateY(-90deg);
            opacity: 0.5;
          }
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes flip-left {
          0% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          50% {
            transform: rotateY(90deg);
            opacity: 0.5;
          }
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }

        .animate-flip-right {
          animation: flip-right 0.6s ease-in-out;
        }

        .animate-flip-left {
          animation: flip-left 0.6s ease-in-out;
        }
      `}</style>
    </div>
  )
}
