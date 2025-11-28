'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

const placeholderImage = "/assets/4d511e8491dcfb5bbcdcade91e90151c344502b6.png"

interface PolaroidCardProps {
  initialPosition?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
  initialTitle?: string
  initialDescription?: string
  initialImageUrl?: string
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onImageChange?: (imageUrl: string) => void
}

export default function PolaroidCard({ 
  initialPosition = { x: 0, y: 0 }, 
  onPositionChange,
  initialTitle = 'Title',
  initialDescription = 'description',
  initialImageUrl = placeholderImage,
  onTitleChange,
  onDescriptionChange,
  onImageChange
}: PolaroidCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const cardRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        setIsDragging(true)
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
        setIsDragging(true)
        e.preventDefault()
      }
      
      setDragOffset({
        x: deltaX,
        y: deltaY,
      })
    }
  }

  const handleMouseUp = () => {
    if (isDragging && onPositionChange) {
      onPositionChange({
        x: initialPosition.x + dragOffset.x,
        y: initialPosition.y + dragOffset.y,
      })
    }
    
    setDragStart({ x: 0, y: 0 })
    setDragOffset({ x: 0, y: 0 })
    setTimeout(() => setIsDragging(false), 100)
  }

  const handleTouchEnd = () => {
    if (isDragging && onPositionChange) {
      onPositionChange({
        x: initialPosition.x + dragOffset.x,
        y: initialPosition.y + dragOffset.y,
      })
    }
    
    setDragStart({ x: 0, y: 0 })
    setDragOffset({ x: 0, y: 0 })
    setTimeout(() => setIsDragging(false), 100)
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
          className="bg-white overflow-clip rounded-[3.5px] w-[339px] h-[402px] shadow-lg"
          data-name="Polaroid Card - Backpane (White)"
          data-node-id="68:15"
        >
          {/* Image Frame */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-[300px] h-[300px] top-[19px] cursor-pointer hover:opacity-90 transition-opacity"
            data-name="Image Frame"
            data-node-id="68:18"
            data-image-frame
            onClick={handleImageClick}
          >
            <img 
              src={imageUrl}
              alt="Polaroid"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {imageUrl === placeholderImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                <span className="text-gray-400 text-sm">Click to upload</span>
              </div>
            )}
          </div>

          {/* Text Area */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 top-[337px] w-[300px] flex flex-col gap-1 text-center"
            data-name="Text"
            data-node-id="68:27"
          >
            {/* Title */}
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                className="font-cursor-gothic-bold text-[16px] text-black w-full text-center bg-transparent border-none outline-none"
                data-node-id="68:25"
              />
            ) : (
              <p 
                className="font-cursor-gothic-bold text-[16px] text-black cursor-text"
                onClick={handleTitleClick}
                data-node-id="68:25"
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
                className="font-['Cursor_Gothic:Regular',sans-serif] text-[12px] text-black w-full text-center bg-transparent border-none outline-none"
                data-node-id="68:26"
              />
            ) : (
              <p 
                className="font-['Cursor_Gothic:Regular',sans-serif] text-[12px] text-black cursor-text"
                onClick={handleDescriptionClick}
                data-node-id="68:26"
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
          className="bg-white overflow-clip rounded-[2.889px] w-full h-full shadow-lg"
          data-name="Polaroid Card - Backpane (White)"
          data-node-id="68:35"
        >
          {/* Image Frame */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-[calc(100%-32px)] aspect-square top-[15.69px] cursor-pointer hover:opacity-90 transition-opacity"
            data-name="Image Frame"
            data-node-id="68:36"
            data-image-frame
            onClick={handleImageClick}
          >
            <img 
              src={imageUrl}
              alt="Polaroid"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {imageUrl === placeholderImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                <span className="text-gray-400 text-xs">Tap to upload</span>
              </div>
            )}
          </div>

          {/* Text Area */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 bottom-4 w-[calc(100%-32px)] flex flex-col gap-[3.304px] text-center"
            data-name="Text"
            data-node-id="68:37"
          >
            {/* Title */}
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                className="font-cursor-gothic-bold text-[13.215px] text-black w-full text-center bg-transparent border-none outline-none"
                data-node-id="68:38"
              />
            ) : (
              <p 
                className="font-cursor-gothic-bold text-[13.215px] text-black cursor-text"
                onClick={handleTitleClick}
                data-node-id="68:38"
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
                className="font-['Cursor_Gothic:Regular',sans-serif] text-[9.912px] text-black w-full text-center bg-transparent border-none outline-none"
                data-node-id="68:39"
              />
            ) : (
              <p 
                className="font-['Cursor_Gothic:Regular',sans-serif] text-[9.912px] text-black cursor-text"
                onClick={handleDescriptionClick}
                data-node-id="68:39"
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

