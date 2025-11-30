'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const defaultImageFrame = "/assets/178af05f21285175ff0b012f2a44f278cd7b626c.svg"
const trashIcon = "/assets/55b01994f4fd191d870dfd4f983d47ffd50168dd.svg"

interface PolaroidCardProps {
  initialPosition?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
  initialTitle?: string
  initialDescription?: string
  initialImageUrl?: string
  initialDateStamp?: string
  initialOverlayText?: string
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onImageChange?: (imageUrl: string) => void
  onOverlayTextChange?: (overlayText: string) => void
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
  initialOverlayText = '',
  onTitleChange,
  onDescriptionChange,
  onImageChange,
  onOverlayTextChange,
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
  const [overlayText, setOverlayText] = useState(initialOverlayText)
  const [showEditOverlay, setShowEditOverlay] = useState(false)
  const [isEditingOverlayText, setIsEditingOverlayText] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardContentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const overlayTextRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const hideButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideOverlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if image has been customized (not the default)
  const hasCustomImage = imageUrl !== defaultImageFrame

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on input fields, image, or edit overlay
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('[data-image-frame]') || target.closest('[data-edit-overlay]')) {
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
    // If image has been uploaded, show edit overlay
    if (hasCustomImage) {
      setShowEditOverlay(true)
      // Clear any existing hide timeout
      if (hideOverlayTimeoutRef.current) {
        clearTimeout(hideOverlayTimeoutRef.current)
        hideOverlayTimeoutRef.current = null
      }
      // Start 2-second auto-hide timer
      hideOverlayTimeoutRef.current = setTimeout(() => {
        if (!isEditingOverlayText) {
          setShowEditOverlay(false)
        }
        hideOverlayTimeoutRef.current = null
      }, 2000)
      return
    }
    // Otherwise, allow image upload
    fileInputRef.current?.click()
  }

  const handleImageTouch = (e: React.TouchEvent) => {
    e.stopPropagation()
    // If image has been uploaded, show edit overlay
    if (hasCustomImage) {
      setShowEditOverlay(true)
      // Clear any existing hide timeout
      if (hideOverlayTimeoutRef.current) {
        clearTimeout(hideOverlayTimeoutRef.current)
        hideOverlayTimeoutRef.current = null
      }
      // Start 2-second auto-hide timer
      hideOverlayTimeoutRef.current = setTimeout(() => {
        if (!isEditingOverlayText) {
          setShowEditOverlay(false)
        }
        hideOverlayTimeoutRef.current = null
      }, 2000)
      return
    }
    // Otherwise, allow image upload
    fileInputRef.current?.click()
  }

  const handleEditOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    // Start editing overlay text
    setIsEditingOverlayText(true)
    // Clear the auto-hide timer when starting to edit
    if (hideOverlayTimeoutRef.current) {
      clearTimeout(hideOverlayTimeoutRef.current)
      hideOverlayTimeoutRef.current = null
    }
  }

  const handleOverlayTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setOverlayText(newText)
  }

  const handleOverlayTextBlur = () => {
    setIsEditingOverlayText(false)
    // Save the overlay text
    onOverlayTextChange?.(overlayText)
    // Start auto-hide timer after editing
    if (hideOverlayTimeoutRef.current) {
      clearTimeout(hideOverlayTimeoutRef.current)
    }
    hideOverlayTimeoutRef.current = setTimeout(() => {
      setShowEditOverlay(false)
      hideOverlayTimeoutRef.current = null
    }, 2000)
  }

  const handleOverlayBackgroundClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    // Clicking on overlay background closes it if not editing
    if (!isEditingOverlayText) {
      setShowEditOverlay(false)
      if (hideOverlayTimeoutRef.current) {
        clearTimeout(hideOverlayTimeoutRef.current)
        hideOverlayTimeoutRef.current = null
      }
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
    if (isEditingOverlayText && overlayTextRef.current) {
      overlayTextRef.current.focus()
      overlayTextRef.current.select()
    }
  }, [isEditingOverlayText])

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hideButtonTimeoutRef.current) {
        clearTimeout(hideButtonTimeoutRef.current)
      }
      if (hideOverlayTimeoutRef.current) {
        clearTimeout(hideOverlayTimeoutRef.current)
      }
    }
  }, [])

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
      onMouseEnter={() => {
        if (!isDragging) {
          // Clear any pending hide timeout
          if (hideButtonTimeoutRef.current) {
            clearTimeout(hideButtonTimeoutRef.current)
            hideButtonTimeoutRef.current = null
          }
          setIsHovered(true)
        }
      }}
      onMouseLeave={() => {
        // Clear any existing timeout
        if (hideButtonTimeoutRef.current) {
          clearTimeout(hideButtonTimeoutRef.current)
        }
        // Set new timeout to hide after 5 seconds
        hideButtonTimeoutRef.current = setTimeout(() => {
          setIsHovered(false)
          hideButtonTimeoutRef.current = null
        }, 5000)
      }}
    >
      {/* Card Content Container */}
      <div ref={cardContentRef} className="w-full h-full">
        {/* Desktop Layout */}
        <div className="hidden md:block relative w-full h-full group">
          <div 
            className={`bg-white overflow-clip rounded-[2.899px] w-[281px] h-[333.221px] border transition-all duration-150 ${
              isDragging ? 'border-blue-300 shadow-2xl' : 'border-[#d9d9d9] shadow-lg'
            } ${!isDragging ? 'group-hover:animate-wiggle' : ''}`}
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
            
            {/* Edit Overlay - Shows when user clicks on image */}
            {showEditOverlay && hasCustomImage && (
              <div 
                className="absolute inset-0 bg-[rgba(67,65,60,0.5)] flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                data-edit-overlay
                onClick={handleOverlayBackgroundClick}
                onTouchEnd={handleOverlayBackgroundClick}
              >
                {!isEditingOverlayText && !overlayText ? (
                  // Show pencil icon when not editing and no text exists
                  <div 
                    className="flex flex-col items-center justify-center"
                    onClick={handleEditOverlayClick}
                    onTouchEnd={handleEditOverlayClick}
                  >
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.0531 3.94689L16.0531 8.94689M13.5 1.5C14.0304 0.969716 14.7548 0.671875 15.5106 0.671875C16.2664 0.671875 16.9909 0.969716 17.5213 1.5C18.0516 2.03028 18.3494 2.75476 18.3494 3.51061C18.3494 4.26647 18.0516 4.99095 17.5213 5.52123L4.18085 18.8617L0 20L1.13829 15.8191L14.4788 2.47873C14.744 2.21343 15.0591 2.00283 15.4059 1.85858C15.7527 1.71434 16.1245 1.63916 16.5 1.63916C16.8755 1.63916 17.2473 1.71434 17.5941 1.85858C17.9409 2.00283 18.256 2.21343 18.5213 2.47873L13.5 1.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : isEditingOverlayText ? (
                  // Show textarea when editing
                  <textarea
                    ref={overlayTextRef}
                    value={overlayText}
                    onChange={handleOverlayTextChange}
                    onBlur={handleOverlayTextBlur}
                    maxLength={150}
                    placeholder="Add a caption..."
                    className="w-[90%] h-[50%] bg-transparent text-white text-center p-4 border-none outline-none resize-none font-['Cursor_Gothic:Regular',sans-serif] text-[14px] placeholder:text-white/60"
                    onClick={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                  />
                ) : null}
                
                {/* Display saved overlay text when not editing and text exists */}
                {!isEditingOverlayText && overlayText && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="font-['Cursor_Gothic:Regular',sans-serif] text-white text-center text-[14px] leading-relaxed break-words">
                      {overlayText}
                    </p>
                  </div>
                )}
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
            
            {/* Edit Overlay - Shows when user clicks on image */}
            {showEditOverlay && hasCustomImage && (
              <div 
                className="absolute inset-0 bg-[rgba(67,65,60,0.5)] flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                data-edit-overlay
                onClick={handleOverlayBackgroundClick}
                onTouchEnd={handleOverlayBackgroundClick}
              >
                {!isEditingOverlayText && !overlayText ? (
                  // Show pencil icon when not editing and no text exists
                  <div 
                    className="flex flex-col items-center justify-center"
                    onClick={handleEditOverlayClick}
                    onTouchEnd={handleEditOverlayClick}
                  >
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.0531 3.94689L16.0531 8.94689M13.5 1.5C14.0304 0.969716 14.7548 0.671875 15.5106 0.671875C16.2664 0.671875 16.9909 0.969716 17.5213 1.5C18.0516 2.03028 18.3494 2.75476 18.3494 3.51061C18.3494 4.26647 18.0516 4.99095 17.5213 5.52123L4.18085 18.8617L0 20L1.13829 15.8191L14.4788 2.47873C14.744 2.21343 15.0591 2.00283 15.4059 1.85858C15.7527 1.71434 16.1245 1.63916 16.5 1.63916C16.8755 1.63916 17.2473 1.71434 17.5941 1.85858C17.9409 2.00283 18.256 2.21343 18.5213 2.47873L13.5 1.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : isEditingOverlayText ? (
                  // Show textarea when editing
                  <textarea
                    ref={overlayTextRef}
                    value={overlayText}
                    onChange={handleOverlayTextChange}
                    onBlur={handleOverlayTextBlur}
                    maxLength={150}
                    placeholder="Add a caption..."
                    className="w-[90%] h-[50%] bg-transparent text-white text-center p-4 border-none outline-none resize-none font-['Cursor_Gothic:Regular',sans-serif] text-[14px] placeholder:text-white/60"
                    onClick={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                  />
                ) : null}
                
                {/* Display saved overlay text when not editing and text exists */}
                {!isEditingOverlayText && overlayText && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="font-['Cursor_Gothic:Regular',sans-serif] text-white text-center text-[14px] leading-relaxed break-words">
                      {overlayText}
                    </p>
                  </div>
                )}
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

      {/* Hover Delete Button - Appears 15px below card */}
      {hasCustomImage && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto"
          style={{
            top: 'calc(100% + 15px)',
            opacity: isHovered ? 1 : 0,
            transform: isHovered 
              ? 'translateX(-50%) translateY(0)' 
              : 'translateX(-50%) translateY(-10px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: isHovered ? 'auto' : 'none',
          }}
          onMouseEnter={() => {
            // Keep button visible when hovering over it
            if (hideButtonTimeoutRef.current) {
              clearTimeout(hideButtonTimeoutRef.current)
              hideButtonTimeoutRef.current = null
            }
            setIsHovered(true)
          }}
          onMouseLeave={() => {
            // Start hide countdown when leaving button
            if (hideButtonTimeoutRef.current) {
              clearTimeout(hideButtonTimeoutRef.current)
            }
            hideButtonTimeoutRef.current = setTimeout(() => {
              setIsHovered(false)
              hideButtonTimeoutRef.current = null
            }, 5000)
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Clear timeout immediately on click
              if (hideButtonTimeoutRef.current) {
                clearTimeout(hideButtonTimeoutRef.current)
                hideButtonTimeoutRef.current = null
              }
              onDelete?.()
            }}
            className="bg-[#ebeae5] box-border flex gap-[10px] items-center p-[10px] rounded-[25px] hover:bg-[#ddd9ce] transition-colors"
            style={{
              boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
            }}
            data-name="Button_Delete"
            data-node-id="86:674"
            aria-label="Delete card"
          >
            <div className="overflow-clip relative shrink-0 w-[20px] h-[20px]">
              <img 
                src={trashIcon}
                alt="Delete"
                className="block w-full h-full"
              />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

