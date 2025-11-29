'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

const defaultImageFrame = "/assets/178af05f21285175ff0b012f2a44f278cd7b626c.svg"

interface PolaroidCardProps {
  initialPosition?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
  initialTitle?: string
  initialDescription?: string
  initialImageUrl?: string
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onImageChange?: (imageUrl: string) => void
  isSelected?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

export default function PolaroidCard({ 
  initialPosition = { x: 0, y: 0 }, 
  onPositionChange,
  initialTitle = 'Title',
  initialDescription = 'description',
  initialImageUrl = defaultImageFrame,
  onTitleChange,
  onDescriptionChange,
  onImageChange,
  isSelected = false,
  onDragStart,
  onDragEnd
}: PolaroidCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [dateStamp, setDateStamp] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if image has been customized (not the default)
  const hasCustomImage = imageUrl !== defaultImageFrame

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on input fields or image
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.closest('[data-image-frame]')) {
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

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      {/* Desktop Layout */}
      <div className="hidden md:block relative w-full h-full">
        <div 
          className={`bg-white overflow-clip rounded-[2.899px] w-[281px] h-[333.221px] border transition-all duration-150 ${
            isDragging ? 'border-blue-300 shadow-2xl' : 'border-[#d9d9d9] shadow-lg'
          }`}
          style={{ borderWidth: isDragging ? '2.2px' : '0.829px' }}
          data-name="Polaroid Card - Backpane (White)"
          data-node-id="70:76"
        >
          {/* Image Frame */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-[248.673px] h-[248.673px] top-[14.92px] cursor-pointer hover:opacity-90 transition-opacity bg-[#14120b] overflow-hidden"
            data-name="Image Frame"
            data-node-id="70:97"
            data-image-frame
            onClick={handleImageClick}
          >
            <img 
              src={imageUrl}
              alt="Polaroid"
              className="block w-full h-full object-cover"
            />
            
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
                className="font-cursor-gothic-bold text-black w-full text-center bg-transparent border-none outline-none"
                style={{ fontSize: '13.263px' }}
                data-node-id="70:80"
              />
            ) : (
              <p 
                className="font-cursor-gothic-bold text-black cursor-text"
                style={{ fontSize: '13.263px' }}
                onClick={handleTitleClick}
                data-node-id="70:80"
              >
                {title}
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
                className="font-['Cursor_Gothic:Regular',sans-serif] text-black w-full text-center bg-transparent border-none outline-none"
                style={{ fontSize: '9.947px' }}
                data-node-id="70:81"
              />
            ) : (
              <p 
                className="font-['Cursor_Gothic:Regular',sans-serif] text-black cursor-text"
                style={{ fontSize: '9.947px' }}
                onClick={handleDescriptionClick}
                data-node-id="70:81"
              >
                {description}
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
          style={{ borderWidth: isDragging ? '1.8px' : '0.68px' }}
          data-name="Polaroid Card - Backpane (White)"
        >
          {/* Image Frame */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-[calc(100%-26px)] aspect-square top-[12px] cursor-pointer hover:opacity-90 transition-opacity bg-[#14120b] overflow-hidden"
            data-name="Image Frame"
            data-image-frame
            onClick={handleImageClick}
          >
            <img 
              src={imageUrl}
              alt="Polaroid"
              className="block w-full h-full object-cover"
            />
            
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
                className="font-cursor-gothic-bold text-black w-full text-center bg-transparent border-none outline-none"
                style={{ fontSize: '11px' }}
              />
            ) : (
              <p 
                className="font-cursor-gothic-bold text-black cursor-text"
                style={{ fontSize: '11px' }}
                onClick={handleTitleClick}
              >
                {title}
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
                className="font-['Cursor_Gothic:Regular',sans-serif] text-black w-full text-center bg-transparent border-none outline-none"
                style={{ fontSize: '8.25px' }}
              />
            ) : (
              <p 
                className="font-['Cursor_Gothic:Regular',sans-serif] text-black cursor-text"
                style={{ fontSize: '8.25px' }}
                onClick={handleDescriptionClick}
              >
                {description}
              </p>
            )}
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

