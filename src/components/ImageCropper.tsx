'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
  // Refs
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // State
  const [zoom, setZoom] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [cropSize, setCropSize] = useState(250) // Dynamic crop size
  const [loading, setLoading] = useState(true)
  const [showRotationControls, setShowRotationControls] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Calculate crop size based on container width
  useEffect(() => {
    const updateCropSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        
        // Make crop size slightly smaller than the container width to add margin
        const newSize = Math.min(containerWidth, 600)
        const canvasSize = newSize
        // Make crop circle slightly smaller than canvas size
        const cropCircleSize = newSize - 16 // 8px margin on each side
        
        setCropSize(cropCircleSize)
        
        // Set canvas dimensions to match container
        if (canvasRef.current) {
          canvasRef.current.width = canvasSize
          canvasRef.current.height = canvasSize
        }
        
        // Update preview canvas size to match crop circle size
        if (previewRef.current) {
          previewRef.current.width = cropCircleSize
          previewRef.current.height = cropCircleSize
        }
        
        // Force canvas update
        updateCanvas()
      }
    }
    
    // Initial update
    updateCropSize()
    
    // Update on resize
    window.addEventListener('resize', updateCropSize)
    return () => window.removeEventListener('resize', updateCropSize)
  }, [imageLoaded])
  
  // WebP conversion for all images to ensure compatibility
  const convertToWebP = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Create a new image to load the source
      const img = new Image();
      
      // Handle successful load
      img.onload = () => {
        try {
          // Create a canvas to draw the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image on the canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Convert to WebP
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create WebP blob'));
              return;
            }
            
            // Create a URL from the blob
            const webpUrl = URL.createObjectURL(blob);
            resolve(webpUrl);
          }, 'image/webp', 0.92); // Good quality but smaller size
        } catch (error) {
          reject(error);
        }
      };
      
      // Handle load errors
      img.onerror = (e) => {
        reject(new Error('Failed to load image for WebP conversion'));
      };
      
      // Handle CORS for remote images
      if (imageUrl.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      
      // Start loading the image
      img.src = imageUrl;
    });
  };
  
  // Load image
  useEffect(() => {
    if (imageRef.current && image) {
      setLoading(true);
      setErrorMessage(null);
      
      // Try to convert to WebP first
      convertToWebP(image)
        .then(webpUrl => {
          console.log('Successfully converted image to WebP');
          const img = imageRef.current;
          if (!img) return;
          
          img.onload = () => {
            console.log('WebP image loaded successfully');
            setImageLoaded(true);
            setLoading(false);
            resetPosition();
          };
          
          img.onerror = () => {
            console.error('WebP image failed to load, trying original...');
            // Fall back to original image
            if (!imageRef.current) return;
            
            imageRef.current.onload = () => {
              console.log('Original image loaded successfully');
              setImageLoaded(true);
              setLoading(false);
              resetPosition();
            };
            
            imageRef.current.onerror = () => {
              console.error('All image loading methods failed');
              setErrorMessage('This image format cannot be loaded. Try saving it to your device first or using a different image.');
              setLoading(false);
            };
            
            // Try original as last resort
            if (image.startsWith('http')) {
              imageRef.current.crossOrigin = 'anonymous';
            }
            imageRef.current.src = image;
          };
          
          img.src = webpUrl;
        })
        .catch(error => {
          console.error('WebP conversion failed:', error);
          
          // Fall back to original image
          const img = imageRef.current;
          if (!img) return;
          
          img.onload = () => {
            console.log('Original image loaded successfully');
            setImageLoaded(true);
            setLoading(false);
            resetPosition();
          };
          
          img.onerror = () => {
            console.error('All image loading methods failed');
            setErrorMessage('This image format cannot be loaded. Try saving it to your device first or using a different image.');
            setLoading(false);
          };
          
          // Try original as last resort
          if (image.startsWith('http')) {
            img.crossOrigin = 'anonymous';
          }
          img.src = image;
        });
    }
  }, [image]);
  
  // Calculate the fit-to-window zoom level
  const getFitToWindowZoom = (img: HTMLImageElement): number => {
    // For wide images, fit to width
    if (img.width > img.height) {
      return cropSize / img.width
    } 
    // For tall images, fit to height
    else {
      return cropSize / img.height
    }
  }

  // Update zoom handling to work with the modified range
  const applyZoom = (zoomValue: number): number => {
    if (!imageRef.current) return 1
    
    // Calculate the fit-to-window zoom level
    const fitZoom = getFitToWindowZoom(imageRef.current)
    
    // Start from the fit zoom and go up
    // zoomValue 0 = fit zoom (no zooming out)
    // zoomValue 1 = fit zoom * 3 (3x zoom in)
    return fitZoom * (1 + zoomValue * 2)
  }

  // Reset position when image changes
  const resetPosition = () => {
    if (!imageRef.current) return
    
    // Start with zoom 0 (fit to window)
    setZoom(0)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    
    updateCanvas()
  }
  
  // Update canvas on state changes
  useEffect(() => {
    if (imageLoaded) {
      updateCanvas()
    }
  }, [zoom, rotation, position, imageLoaded, cropSize])
  
  // Constrain position to keep image inside crop area when zoomed out
  const constrainPosition = (newPosition: {x: number, y: number}, zoomLevel: number): {x: number, y: number} => {
    // When fully zoomed out, center the image
    if (zoomLevel <= 0.01) {
      return { x: 0, y: 0 }
    }
    
    // Allow some movement when slightly zoomed in
    return newPosition
  }
  
  // Update canvas with proper zoom
  const updateCanvas = () => {
    if (!imageRef.current || !canvasRef.current || !previewRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    const previewCtx = previewRef.current.getContext('2d')
    
    if (!ctx || !previewCtx) return
    
    const img = imageRef.current
    const canvas = canvasRef.current
    const preview = previewRef.current
    
    // Ensure canvas dimensions are set
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = cropSize
      canvas.height = cropSize
    }
    
    // Ensure preview dimensions are set
    if (preview.width === 0 || preview.height === 0) {
      preview.width = cropSize
      preview.height = cropSize
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    previewCtx.clearRect(0, 0, preview.width, preview.height)
    
    // Save context state
    ctx.save()
    
    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2)
    
    // Apply transformations
    ctx.rotate((rotation * Math.PI) / 180)
    
    // Apply the adjusted zoom level
    const effectiveZoom = applyZoom(zoom)
    ctx.scale(effectiveZoom, effectiveZoom)
    
    // Apply position offset
    ctx.translate(position.x, position.y)
    
    // Draw image centered
    ctx.drawImage(
      img,
      -img.width / 2,
      -img.height / 2,
      img.width,
      img.height
    )
    
    // Restore context state
    ctx.restore()
    
    // Update preview first - before adding overlay
    updatePreview()
    
    // Add overlay around the crop area (outside the circle)
    drawCropOverlay(ctx, canvas.width, canvas.height)
  }
  
  // Draw crop area overlay
  const drawCropOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = cropSize / 2
    
    // Save context state
    ctx.save()
    
    // First create clipping region outside the circle
    ctx.beginPath()
    ctx.rect(0, 0, width, height)
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true) // true = counterclockwise = hole
    ctx.clip()
    
    // Fill the clipped area with semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
    ctx.fillRect(0, 0, width, height)
    
    // Restore to remove clipping
    ctx.restore()
    
    // Draw circle border
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
  
  // Update preview canvas
  const updatePreview = () => {
    if (!canvasRef.current || !previewRef.current) return
    
    const canvas = canvasRef.current
    const preview = previewRef.current
    const previewCtx = preview.getContext('2d')
    
    if (!previewCtx) return
    
    // Calculate center of canvas
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = cropSize / 2
    
    // Calculate crop area with the margin considered
    const cropX = centerX - radius
    const cropY = centerY - radius
    const cropData = canvas.getContext('2d')?.getImageData(
      cropX, cropY, cropSize, cropSize
    )
    
    if (!cropData) return
    
    // Draw cropped image on preview
    previewCtx.putImageData(cropData, 0, 0)
  }
  
  // Generate final cropped image
  const generateCroppedImage = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!previewRef.current) {
        reject(new Error('Preview canvas not available'))
        return
      }
      
      previewRef.current.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'))
            return
          }
          resolve(blob)
        },
        'image/jpeg',
        0.95
      )
    })
  }
  
  // Mouse event handlers - direct image manipulation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get canvas-relative coordinates (crucial for direct manipulation feeling)
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragStart({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    
    // Get canvas-relative coordinates
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate delta in canvas coordinates
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    // Scale the movement based on zoom level for natural feeling
    const effectiveZoom = applyZoom(zoom);
    
    // Apply rotation correction to the movement vector
    const rotationRadians = (rotation * Math.PI) / 180;
    const cos = Math.cos(rotationRadians);
    const sin = Math.sin(rotationRadians);
    
    // Rotate the movement vector according to the image rotation
    const rotatedDeltaX = (deltaX * cos + deltaY * sin) / effectiveZoom;
    const rotatedDeltaY = (deltaY * cos - deltaX * sin) / effectiveZoom;
    
    setPosition(prev => ({
      x: prev.x + rotatedDeltaX,
      y: prev.y + rotatedDeltaY
    }));
    
    // Update drag start for next move
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // For wheel/pinch zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    // Increase the sensitivity for smoother, faster zooming on PC
    const delta = Math.sign(e.deltaY) * -0.1;
    
    setZoom((prevZoom) => {
      // Constrain the zoom value between 0 and 1
      return Math.max(0, Math.min(1, prevZoom + delta));
    });
  };

  // Handle pinch-to-zoom
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  const calculateTouchDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch event handlers - direct touch manipulation
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Handle pinch gesture
    if (e.touches.length === 2) {
      setTouchDistance(calculateTouchDistance(e.touches));
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length !== 1) return;
    
    // Get canvas-relative coordinates
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    setDragStart({ x, y });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    // Handle pinch gesture
    if (e.touches.length === 2 && touchDistance !== null) {
      const currentDistance = calculateTouchDistance(e.touches);
      const delta = (currentDistance - touchDistance) * 0.005;
      setTouchDistance(currentDistance);
      setZoom(Math.max(0, Math.min(1, zoom + delta)));
      return;
    }
    
    const canvas = canvasRef.current;
    if (!isDragging || !canvas || e.touches.length !== 1) return;
    
    // Get canvas-relative coordinates
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    // Calculate delta in canvas coordinates
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    // Scale the movement based on zoom level for natural feeling
    const effectiveZoom = applyZoom(zoom);
    
    // Apply rotation correction to the movement vector
    const rotationRadians = (rotation * Math.PI) / 180;
    const cos = Math.cos(rotationRadians);
    const sin = Math.sin(rotationRadians);
    
    // Rotate the movement vector according to the image rotation
    const rotatedDeltaX = (deltaX * cos + deltaY * sin) / effectiveZoom;
    const rotatedDeltaY = (deltaY * cos - deltaX * sin) / effectiveZoom;
    
    setPosition(prev => ({
      x: prev.x + rotatedDeltaX,
      y: prev.y + rotatedDeltaY
    }));
    
    // Update drag start for next move
    setDragStart({ x, y });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Reset touch distance when no longer using 2 fingers
    if (e.touches.length < 2) {
      setTouchDistance(null);
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };
  
  // Handle final crop
  const handleCrop = async () => {
    try {
      const croppedImage = await generateCroppedImage()
      onCropComplete(croppedImage)
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }
  
  // Reset to defaults
  const handleReset = () => {
    resetPosition()
  }
  
  // Return adjusted display value for zoom
  const getDisplayZoom = (): number => {
    if (!imageRef.current) return 100
    
    const effectiveZoom = applyZoom(zoom)
    return Math.round(effectiveZoom * 100)
  }
  
  // Reset position to center when zoom changes to 0
  useEffect(() => {
    // If zoom is exactly 0 (reset or fully zoomed out), center the image
    if (zoom === 0) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);
  
  // Add a toggle function
  const toggleRotationControls = () => {
    setShowRotationControls(!showRotationControls);
  };
  
  // Prevent scrolling on the main window when the cropper is open
  useEffect(() => {
    const preventDefault = (e: Event) => {
      // Check if the target is the rotation slider
      if (e.target instanceof HTMLInputElement && e.target.type === 'range') {
        // Allow range slider events to pass through
        return;
      }
      
      // Otherwise prevent default behavior
      e.preventDefault();
    };
    
    // Add event listener to block scrolling on the entire document
    document.addEventListener('wheel', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    // Cleanup when component unmounts
    return () => {
      document.removeEventListener('wheel', preventDefault);
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);
  
  // Handle rotation slider touch events separately
  const handleRotationSliderTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    // Allow this specific touch event without prevention
    e.stopPropagation();
  };
  
  const handleRotationSliderTouchMove = (e: React.TouchEvent<HTMLInputElement>) => {
    // Allow the slider to move, but prevent propagation
    e.stopPropagation();
  };
  
  // Add ESC key handler to close the cropper
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCrop();
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, handleCrop]);
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
      onWheel={(e) => e.stopPropagation()}
    >
      <div ref={containerRef} className="relative w-full max-w-md bg-[#7D1A1D] rounded-lg overflow-hidden shadow-2xl font-['Google_Sans',Arial,sans-serif] text-[14px]">
        <div className="p-3 text-white flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2">
            <button 
              onClick={onCancel}
              className="p-1 hover:bg-[#5D1315] rounded-full transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 className="text-xl font-normal">Edit Photo</h2>
          </div>
        </div>
        
        {/* Hidden image for loading */}
        <img 
          ref={imageRef}
          alt="Source"
          className="hidden"
        />
        
        {/* Main canvas for editing */}
        <div className="relative bg-neutral-900 flex justify-center items-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
              <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full aspect-square touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          />
          
          {/* Debugging info - can be removed after fixing */}
          {!loading && !imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white text-sm p-4 text-center">
              <p>Failed to load image.</p>
              {errorMessage ? (
                <p className="mt-2 text-xs opacity-80">{errorMessage}</p>
              ) : (
                <p className="mt-2 text-xs opacity-70">{image.substring(0, 50)}...</p>
              )}
              <div className="mt-4">
                <p className="text-xs opacity-80">Tips:</p>
                <ul className="text-xs mt-1 opacity-70 text-left list-disc pl-4">
                  <li>Save the image to your device first</li>
                  <li>Try using a different image</li>
                  <li>Images from Instagram may need to be downloaded first</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Instructions */}
          {imageLoaded && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <div className="bg-[#7D1A1D]/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
                <span>Pinch or scroll to zoom • Drag to position</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls section */}
        <div className="bg-[#7D1A1D] text-white">
          {/* Rotation slider - only shown when toggled */}
          {showRotationControls && (
            <div className="px-4 pt-3">
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                onTouchStart={handleRotationSliderTouchStart}
                onTouchMove={handleRotationSliderTouchMove}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
              />
            </div>
          )}
          
          {/* Bottom toolbar with buttons */}
          <div className="p-4 flex items-center justify-between">
            {/* Image rotate button and label */}
            <div className="flex flex-col items-center">
              <button
                onClick={toggleRotationControls}
                className="p-2 hover:bg-[#5D1315] rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="M496-182 182-496q-23-23-23-54t23-54l174-174q23-23 54-23t54 23l314 314q23 23 23 54t-23 54L604-182q-23 23-54 23t-54-23Zm54-58 170-170-310-310-170 170 310 310ZM480 0q-99 0-186.5-37.5t-153-103Q75-206 37.5-293.5T0-480h80q0 71 24 136t66.5 117Q213-175 272-138.5T401-87L296-192l56-56L588-12q-26 6-53.5 9T480 0Zm400-480q0-71-24-136t-66.5-117Q747-785 688-821.5T559-873l105 105-56 56-236-236q26-6 53.5-9t54.5-3q99 0 186.5 37.5t153 103q65.5 65.5 103 153T960-480h-80Zm-400 0Z"/>
                </svg>
              </button>
              <span className="text-xs mt-1">Rotate</span>
            </div>
            
            {/* Apply button */}
            <button
              onClick={handleCrop}
              className="px-4 py-2 text-white bg-[#5D1315] hover:bg-[#4D1012] rounded-md transition-colors text-sm font-medium"
            >
              Apply
            </button>
          </div>
        </div>
        
        {/* Hidden preview canvas */}
        <canvas
          ref={previewRef}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ImageCropper 