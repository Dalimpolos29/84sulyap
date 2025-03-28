'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import ImageRotateIcon from './icons/image-rotate.svg'
import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'

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
  const [detectingFace, setDetectingFace] = useState(false)
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

  // Load model and detect face when image changes
  useEffect(() => {
    if (image) {
      // Reset zoom and position when image changes
      setCrop({ x: 0, y: 0 })
      setZoom(1.2)
      
      // Detect face
      detectFace()
    }
  }, [image])

  // Function to detect face and center crop on it
  const detectFace = async () => {
    try {
      setDetectingFace(true)
      
      // Load model
      await tf.ready()
      const model = await blazeface.load()
      
      // Create image element to pass to the model
      const img = new Image()
      img.src = image
      await new Promise((resolve) => {
        img.onload = resolve
      })
      
      // Get predictions
      const predictions = await model.estimateFaces(img, false)
      
      if (predictions.length > 0) {
        // Get the first face detected
        const face = predictions[0]
        
        // Get image dimensions
        const imgWidth = img.width
        const imgHeight = img.height
        
        // Calculate face center relative to image size
        // Use type assertion to handle the Tensor1D | [number, number] union type
        const topLeft = face.topLeft as [number, number]
        const bottomRight = face.bottomRight as [number, number]
        
        const faceX = (topLeft[0] + bottomRight[0]) / 2
        const faceY = (topLeft[1] + bottomRight[1]) / 2
        
        // Convert to percentage (which is what react-easy-crop uses)
        const cropX = ((faceX / imgWidth) - 0.5) * 100
        const cropY = ((faceY / imgHeight) - 0.5) * 100
        
        // Set crop to center on face
        setCrop({ x: cropX, y: cropY })
        
        // Calculate appropriate zoom based on face size
        const faceWidth = bottomRight[0] - topLeft[0]
        const faceHeight = bottomRight[1] - topLeft[1]
        const faceDimension = Math.max(faceWidth, faceHeight)
        
        // Set zoom to make face fill about 70% of the crop area
        // (higher value = face appears smaller)
        const newZoom = (imgWidth * 0.7) / faceDimension
        setZoom(Math.max(1.2, Math.min(newZoom, 2.5))) // Limit between 1.2 and 2.5
      }
    } catch (error) {
      console.error('Error detecting face:', error)
    } finally {
      setDetectingFace(false)
    }
  }

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
          
          {detectingFace && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span className="text-white text-sm">Detecting face...</span>
              </div>
            </div>
          )}
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