'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import ImageRotateIcon from './icons/image-rotate.svg'

// Define the Area type locally since we can't import it directly
interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.2)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [rotation, setRotation] = useState(0)
  const [showRotationSlider, setShowRotationSlider] = useState(false)
  const cropperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cropSize, setCropSize] = useState({ width: 300, height: 300 })
  
  // Adjust crop size based on container size
  useEffect(() => {
    const updateCropSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const size = Math.min(containerWidth, containerWidth) - 20 // Less padding
        setCropSize({ width: size, height: size })
      }
    }
    
    updateCropSize()
    window.addEventListener('resize', updateCropSize)
    
    return () => {
      window.removeEventListener('resize', updateCropSize)
    }
  }, [])

  // Center the image when it's loaded
  useEffect(() => {
    if (image) {
      // Reset zoom and position when image changes
      setCrop({ x: 0, y: 0 })
      setZoom(1.2)
    }
  }, [image])

  const onCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop)
  }

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom)
  }

  const onCropCompleteCallback = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Set canvas size to match the cropped image
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    // Convert canvas to blob
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleCrop = async () => {
    if (!croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error('Error cropping image:', e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div ref={cropperRef} className="relative w-full max-w-md bg-[#7D1A1D] rounded-lg overflow-hidden">
        <div className="p-2 sm:p-3 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={onCancel}
              className="p-1 hover:bg-[#5D1315] rounded-full transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 className="text-lg sm:text-xl font-semibold">Edit Photo</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCrop}
              className="px-3 py-1 sm:px-4 sm:py-1.5 text-white hover:bg-[#5D1315] rounded-md transition-colors text-sm sm:text-base"
            >
              Apply
            </button>
          </div>
        </div>
        
        <div ref={containerRef} className="relative aspect-square w-full bg-neutral-800 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={true}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteCallback}
              objectFit="cover"
              minZoom={0.8}
              maxZoom={5}
              cropSize={cropSize}
              restrictPosition={false}
              rotation={rotation}
            />
          </div>
          
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="bg-[#7D1A1D]/70 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur">
              <div className="flex items-center gap-1 sm:gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v10M4 13l8 8 8-8"/>
                </svg>
                <span>Pinch or use mouse wheel to zoom</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rotation Controls */}
        <div className="p-2 sm:p-3 text-white flex justify-between items-center border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRotationSlider(!showRotationSlider)}
              className="p-1 hover:bg-[#5D1315] rounded-full transition-colors"
              aria-label="Toggle rotation slider"
            >
              <ImageRotateIcon className="w-5 h-5" />
            </button>
          </div>
          {showRotationSlider && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-[#7D1A1D] px-4 py-2 rounded-full">
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-48 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageCropper 