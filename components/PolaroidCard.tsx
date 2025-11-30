'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { supabase } from '@/lib/supabase'

const defaultImageFrame = "/assets/178af05f21285175ff0b012f2a44f278cd7b626c.svg"
const shareIcon = "/assets/90b8f138c6f3c265f6eabac618542b6a23368454.svg"

interface PolaroidCardProps {
  initialPosition?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
  initialTitle?: string
  initialDescription?: string
  initialImageUrl?: string
  initialDateStamp?: string
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onImageChange?: (imageUrl: string) => void
  isSelected?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onDelete?: () => void
}

export default function PolaroidCard({ 
  initialPosition = { x: 0, y: 0 }, 
  onPositionChange,
  initialTitle = '',
  initialDescription = '',
  initialImageUrl = defaultImageFrame,
  initialDateStamp = '',
  onTitleChange,
  onDescriptionChange,
  onImageChange,
  isSelected = false,
  onDragStart,
  onDragEnd,
  onDelete
}: PolaroidCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [dateStamp, setDateStamp] = useState(initialDateStamp)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardContentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false)

  // Check if image has been customized (not the default)
  const hasCustomImage = imageUrl !== defaultImageFrame

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on input fields, image, or delete overlay
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.closest('[data-image-frame]') || target.closest('[data-delete-overlay]')) {
      return
    }

    setIsDragging(false)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
    setDragOffset({ x: 0, y: 0 })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start drag if touching input fields or image
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.closest('[data-image-frame]')) {
      return
    }

    const touch = e.touches[0]
    setIsDragging(false)
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
    })
    setDragOffset({ x: 0, y: 0 })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (dragStart.x !== 0 || dragStart.y !== 0) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        if (!isDragging) {
          setIsDragging(true)
          onDragStart?.() // Notify parent that drag started
        }
      }
      
      setDragOffset({
        x: deltaX,
        y: deltaY,
      })
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (dragStart.x !== 0 || dragStart.y !== 0) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - dragStart.x
      const deltaY = touch.clientY - dragStart.y
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        if (!isDragging) {
          setIsDragging(true)
          onDragStart?.() // Notify parent that drag started
        }
        e.preventDefault()
      }
      
      setDragOffset({
        x: deltaX,
        y: deltaY,
      })
    }
  }

  const handleMouseUp = () => {
    const wasDragging = isDragging
    
    if (isDragging && onPositionChange) {
      onPositionChange({
        x: initialPosition.x + dragOffset.x,
        y: initialPosition.y + dragOffset.y,
      })
    }
    
    setDragStart({ x: 0, y: 0 })
    setDragOffset({ x: 0, y: 0 })
    
    // Clear dragging state and notify parent
    setTimeout(() => {
      setIsDragging(false)
      if (wasDragging) {
        onDragEnd?.() // Notify parent that drag ended
      }
    }, 100)
  }

  const handleTouchEnd = () => {
    const wasDragging = isDragging
    
    if (isDragging && onPositionChange) {
      onPositionChange({
        x: initialPosition.x + dragOffset.x,
        y: initialPosition.y + dragOffset.y,
      })
    }
    
    setDragStart({ x: 0, y: 0 })
    setDragOffset({ x: 0, y: 0 })
    
    // Clear dragging state and notify parent
    setTimeout(() => {
      setIsDragging(false)
      if (wasDragging) {
        onDragEnd?.() // Notify parent that drag ended
      }
    }, 100)
  }

  const handleTitleClick = () => {
    setIsEditingTitle(true)
  }

  const handleDescriptionClick = () => {
    setIsEditingDescription(true)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    onTitleChange?.(newTitle)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDesc = e.target.value
    setDescription(newDesc)
    onDescriptionChange?.(newDesc)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
  }

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // If image has been uploaded, show delete overlay instead
    if (hasCustomImage) {
      setShowDeleteOverlay(true)
      return
    }
    // Otherwise, allow image upload
    fileInputRef.current?.click()
  }

  const handleImageTouch = (e: React.TouchEvent) => {
    e.stopPropagation()
    // If image has been uploaded, show delete overlay instead
    if (hasCustomImage) {
      setShowDeleteOverlay(true)
      return
    }
    // Otherwise, allow image upload
    fileInputRef.current?.click()
  }

  const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDelete?.()
    }
    setShowDeleteOverlay(false)
  }

  const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    // Clicking on overlay (not the delete text) closes it
    const target = e.target as HTMLElement
    if (!target.closest('[data-delete-text]')) {
      setShowDeleteOverlay(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent changing image if a custom image has already been uploaded
    if (hasCustomImage) {
      return
    }
    
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImageUrl(result)
        onImageChange?.(result)
        
        // Set date stamp to current date when image is uploaded
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const year = now.getFullYear()
        setDateStamp(`${month}/${day}/${year}`)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleShare = async () => {
    if (!cardContentRef.current) return
    
    setIsSharing(true)
    
    try {
      // Find the Polaroid card content element
      const cardContent = cardContentRef.current.querySelector('[data-name="Polaroid Card - Backpane (White)"]') as HTMLElement
      
      if (!cardContent) {
        console.error('Card content not found')
        setIsSharing(false)
        return
      }

      // Hide delete overlay during capture
      const wasDeleteOverlayVisible = showDeleteOverlay
      if (showDeleteOverlay) {
        setShowDeleteOverlay(false)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Wait for images to load with proper error handling
      const images = cardContent.querySelectorAll('img')
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = () => resolve(true)
            img.onerror = () => resolve(false)
            // Longer timeout for images to load
            setTimeout(() => resolve(false), 3000)
          })
        })
      )

      // Store original styles to restore later
      const cardContainer = cardRef.current
      const originalTransform = cardContainer?.style.transform || ''
      const originalTransition = cardContainer?.style.transition || ''
      
      // Temporarily remove transforms and transitions for clean capture
      if (cardContainer) {
        cardContainer.style.transform = 'none'
        cardContainer.style.transition = 'none'
      }
      
      // Wait longer for layout to stabilize (150-200ms as recommended)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Capture with enhanced configuration
      const canvas = await html2canvas(cardContent, {
        backgroundColor: '#ffffff',
        scale: 2, // High quality
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0, // No timeout for image loading
        logging: false,
        width: cardContent.offsetWidth,
        height: cardContent.offsetHeight,
        windowWidth: cardContent.offsetWidth,
        windowHeight: cardContent.offsetHeight,
        onclone: (clonedDoc) => {
          // Clean up the cloned element for proper capture
          const clonedElement = clonedDoc.querySelector('[data-name="Polaroid Card - Backpane (White)"]') as HTMLElement
          if (clonedElement) {
            clonedElement.style.transform = 'none'
            clonedElement.style.position = 'relative'
            clonedElement.style.isolation = 'isolate'
          }
          
          // Ensure all images in clone have proper attributes
          const clonedImages = clonedDoc.querySelectorAll('img')
          clonedImages.forEach((img: HTMLImageElement) => {
            img.style.display = 'block'
            img.style.visibility = 'visible'
            img.style.opacity = '1'
          })
          
          // Remove any delete overlays from clone
          const deleteOverlays = clonedDoc.querySelectorAll('[data-delete-overlay]')
          deleteOverlays.forEach(overlay => overlay.remove())
          
          // Ensure image frames don't have black backgrounds visible
          const imageFrames = clonedDoc.querySelectorAll('[data-image-frame]')
          imageFrames.forEach((frame: HTMLElement) => {
            // Only keep black background if there's no custom image
            if (hasCustomImage) {
              frame.style.backgroundColor = 'transparent'
            }
          })
        }
      })
      
      // Restore original styles
      if (cardContainer) {
        cardContainer.style.transform = originalTransform
        cardContainer.style.transition = originalTransition
      }
      
      // Restore delete overlay state
      if (wasDeleteOverlayVisible) {
        setShowDeleteOverlay(true)
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/png', 1.0)
      })

      // Upload to Supabase Storage (CDN)
      const fileName = `shared/polaroid-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('polaroid-images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png'
        })

      if (uploadError) {
        console.error('Error uploading to CDN:', uploadError)
        // Fallback: Download the image locally
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `cafe-cursor-polaroid-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        alert('Image downloaded! Upload failed, but you can share the downloaded file.')
        setIsSharing(false)
        return
      }

      // Get public URL from CDN
      const { data: { publicUrl } } = supabase.storage
        .from('polaroid-images')
        .getPublicUrl(uploadData.path)

      // Open image in new tab
      window.open(publicUrl, '_blank')
      
      // Also try to copy the URL to clipboard
      try {
        await navigator.clipboard.writeText(publicUrl)
        alert('Image opened in new tab! URL copied to clipboard - you can paste it to share on Twitter, email, etc.')
      } catch (clipboardError) {
        alert('Image opened in new tab! Right-click to copy the image or URL to share.')
      }
      
    } catch (error) {
      console.error('Error sharing:', error)
      alert('Failed to share. Please try again.')
    }
    
    setIsSharing(false)
  }

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [isEditingTitle])

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus()
      descriptionRef.current.select()
    }
  }, [isEditingDescription])

  useEffect(() => {
    if (dragStart.x !== 0 || dragStart.y !== 0) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [dragStart, dragOffset, isDragging, initialPosition, onPositionChange])

  return (
    <div 
      ref={cardRef}
      className="relative w-full h-full"
      style={{ 
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Share Button - Only visible when image is uploaded */}
      {hasCustomImage && (
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-[46px] z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleShare()
            }}
            disabled={isSharing}
            className="bg-[#d9d9d9] box-border flex gap-[5px] items-center px-[10px] py-[5px] rounded-[10px] hover:bg-[#c5c5c5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
            }}
            data-name="Button_Share"
            data-node-id="77:491"
          >
            <div className="flex items-center justify-center shrink-0 w-[15.614px] h-[15.614px]">
              <div className="transform rotate-[54deg]">
                <img 
                  src={shareIcon}
                  alt="Share"
                  className="block w-[11.179px] h-[11.178px]"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
            <div className="flex flex-col font-['Cursor_Gothic:Regular',sans-serif] h-[22px] justify-end leading-[0] shrink-0 text-[#14120b] text-[15px] w-[41px]">
              <p className="leading-normal">
                {isSharing ? 'Sharing...' : 'Share'}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Card Content Container */}
      <div ref={cardContentRef} className="w-full h-full">
        {/* Desktop Layout */}
        <div className="hidden md:block relative w-full h-full">
          <div 
            className={`bg-white overflow-clip rounded-[2.899px] w-[281px] h-[333.221px] border transition-all duration-150 ${
              isDragging ? 'border-blue-300 shadow-2xl' : 'border-[#d9d9d9] shadow-lg'
            }`}
            style={{ 
              borderWidth: isDragging ? '2.2px' : '0.829px',
              isolation: 'isolate'
            }}
            data-name="Polaroid Card - Backpane (White)"
            data-node-id="70:76"
          >
          {/* Image Frame */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-[248.673px] h-[248.673px] top-[14.92px] transition-opacity bg-[#14120b] overflow-hidden ${
              hasCustomImage ? 'cursor-pointer' : 'cursor-pointer hover:opacity-90'
            }`}
            data-name="Image Frame"
            data-node-id="70:97"
            data-image-frame
            onClick={handleImageClick}
            onTouchEnd={handleImageTouch}
          >
            <img 
              src={imageUrl}
              alt="Polaroid"
              className="block w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            
            {/* Delete Overlay - Shows when user clicks on image */}
            {showDeleteOverlay && hasCustomImage && (
              <div 
                className="absolute inset-0 bg-[rgba(67,65,60,0.5)] flex items-center justify-center cursor-pointer"
                data-delete-overlay
                onClick={handleOverlayClick}
                onTouchEnd={handleOverlayClick}
              >
                <div 
                  className="flex flex-col font-['Cursor_Gothic:Regular',sans-serif] justify-end leading-[0] text-[15px] text-white cursor-pointer"
                  data-delete-text
                  onClick={handleDeleteClick}
                  onTouchEnd={handleDeleteClick}
                >
                  <p className="leading-normal whitespace-pre">Delete?</p>
                </div>
              </div>
            )}
            
            {/* Date Stamp - Only shows when custom image is uploaded */}
            {hasCustomImage && dateStamp && (
              <p 
                className="absolute bottom-[25.42px] right-[45.75px] transform translate-x-1/2 translate-y-full font-['Cursor_Gothic:Italic',sans-serif] italic leading-normal text-[#f69c00] text-[10px] text-center whitespace-nowrap"
                data-node-id="70:104"
              >
                {dateStamp}
              </p>
            )}
          </div>

          {/* Text Area */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 top-[278.51px] w-[248.673px] flex flex-col text-center"
            style={{ gap: '3.316px' }}
            data-name="Text"
            data-node-id="70:79"
          >
            {/* Title */}
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                maxLength={30}
                placeholder="Add Name"
                className="font-cursor-gothic-bold text-black w-full text-center bg-transparent border-none outline-none placeholder:text-gray-400"
                style={{ fontSize: '13.263px' }}
                data-node-id="70:80"
              />
            ) : (
              <p 
                className="font-cursor-gothic-bold text-black cursor-text overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: '13.263px' }}
                onClick={handleTitleClick}
                data-node-id="70:80"
              >
                {title || 'Add Name'}
              </p>
            )}
            
            {/* Description */}
            {isEditingDescription ? (
              <input
                ref={descriptionRef}
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                maxLength={45}
                placeholder="what are you building today?"
                className="font-['Cursor_Gothic:Regular',sans-serif] text-black w-full text-center bg-transparent border-none outline-none placeholder:text-gray-400"
                style={{ fontSize: '9.947px' }}
                data-node-id="70:81"
              />
            ) : (
              <p 
                className="font-['Cursor_Gothic:Regular',sans-serif] text-black cursor-text overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: '9.947px' }}
                onClick={handleDescriptionClick}
                data-node-id="70:81"
              >
                {description || 'what are you building today?'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden relative w-full h-full">
        <div 
          className={`bg-white overflow-clip rounded-[2.4px] w-full h-full border transition-all duration-150 ${
            isDragging ? 'border-blue-300 shadow-2xl' : 'border-[#d9d9d9] shadow-lg'
          }`}
          style={{ 
            borderWidth: isDragging ? '1.8px' : '0.68px',
            isolation: 'isolate'
          }}
          data-name="Polaroid Card - Backpane (White)"
        >
          {/* Image Frame */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-[calc(100%-26px)] aspect-square top-[12px] transition-opacity bg-[#14120b] overflow-hidden ${
              hasCustomImage ? 'cursor-pointer' : 'cursor-pointer hover:opacity-90'
            }`}
            data-name="Image Frame"
            data-image-frame
            onClick={handleImageClick}
            onTouchEnd={handleImageTouch}
          >
            <img 
              src={imageUrl}
              alt="Polaroid"
              className="block w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            
            {/* Delete Overlay - Shows when user clicks on image */}
            {showDeleteOverlay && hasCustomImage && (
              <div 
                className="absolute inset-0 bg-[rgba(67,65,60,0.5)] flex items-center justify-center cursor-pointer"
                data-delete-overlay
                onClick={handleOverlayClick}
                onTouchEnd={handleOverlayClick}
              >
                <div 
                  className="flex flex-col font-['Cursor_Gothic:Regular',sans-serif] justify-end leading-[0] text-[15px] text-white cursor-pointer"
                  data-delete-text
                  onClick={handleDeleteClick}
                  onTouchEnd={handleDeleteClick}
                >
                  <p className="leading-normal whitespace-pre">Delete?</p>
                </div>
              </div>
            )}
            
            {/* Date Stamp - Only shows when custom image is uploaded */}
            {hasCustomImage && dateStamp && (
              <p 
                className="absolute bottom-[21px] right-[38px] transform translate-x-1/2 translate-y-full font-['Cursor_Gothic:Italic',sans-serif] italic leading-normal text-[#f69c00] text-[8.3px] text-center whitespace-nowrap"
              >
                {dateStamp}
              </p>
            )}
          </div>

          {/* Text Area */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 bottom-4 w-[calc(100%-26px)] flex flex-col text-center"
            style={{ gap: '2.75px' }}
            data-name="Text"
          >
            {/* Title */}
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                maxLength={30}
                placeholder="Add Name"
                className="font-cursor-gothic-bold text-black w-full text-center bg-transparent border-none outline-none placeholder:text-gray-400"
                style={{ fontSize: '16px' }}
              />
            ) : (
              <p 
                className="font-cursor-gothic-bold text-black cursor-text overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: '11px' }}
                onClick={handleTitleClick}
              >
                {title || 'Add Name'}
              </p>
            )}
            
            {/* Description */}
            {isEditingDescription ? (
              <input
                ref={descriptionRef}
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                maxLength={45}
                placeholder="what are you building today?"
                className="font-['Cursor_Gothic:Regular',sans-serif] text-black w-full text-center bg-transparent border-none outline-none placeholder:text-gray-400"
                style={{ fontSize: '16px' }}
              />
            ) : (
              <p 
                className="font-['Cursor_Gothic:Regular',sans-serif] text-black cursor-text overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: '8.25px' }}
                onClick={handleDescriptionClick}
              >
                {description || 'what are you building today?'}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

