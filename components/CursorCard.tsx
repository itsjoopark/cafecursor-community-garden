'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

const imgFrame3 = "/assets/1248e145647ad8423f658694cf11e64b96384e49.svg"

interface CursorCardProps {
  variant?: 'dark' | 'light'
  initialPosition?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
}

export default function CursorCard({ variant = 'dark', initialPosition = { x: 0, y: 0 }, onPositionChange }: CursorCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [message, setMessage] = useState('Type your message...')
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Color variants
  const bgColor = variant === 'dark' ? 'bg-[#14120b]' : 'bg-[#f0efea]'
  const textColor = variant === 'dark' ? 'text-[#f0efea]' : 'text-[#14120b]'
  const placeholderColor = variant === 'dark' ? 'placeholder:text-[#f0efea]' : 'placeholder:text-[#14120b]'
  const caretColor = variant === 'dark' ? '#f0efea' : '#14120b'

  const handleCardClick = (e: React.MouseEvent) => {
    // Only flip if not currently editing and not dragging
    if (!isEditing && !isDragging) {
      setIsFlipped(!isFlipped)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on text area
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
      return
    }
    
    setIsDragging(false)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
    setDragOffset({ x: 0, y: 0 })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (dragStart.x !== 0 || dragStart.y !== 0) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      // If moved more than 5px, consider it a drag
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIsDragging(true)
      }
      
      setDragOffset({
        x: deltaX,
        y: deltaY,
      })
    }
  }

  const handleMouseUp = () => {
    if (isDragging && onPositionChange) {
      // Report final position change to parent
      onPositionChange({
        x: initialPosition.x + dragOffset.x,
        y: initialPosition.y + dragOffset.y,
      })
    }
    
    setDragStart({ x: 0, y: 0 })
    setDragOffset({ x: 0, y: 0 })
    
    // Reset dragging state after a short delay to prevent flip on drag end
    setTimeout(() => setIsDragging(false), 100)
  }

  const handleTextAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Always prevent card flip when clicking text area
    
    // If not editing, enter edit mode on click
    if (!isEditing) {
      setIsEditing(true)
      if (message === 'Type your message...') {
        setMessage('')
      }
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (message.trim() === '') {
      setMessage('Type your message...')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Exit edit mode on Escape key
    if (e.key === 'Escape') {
      setIsEditing(false)
      textareaRef.current?.blur()
    }
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    // Add global mouse event listeners for dragging
    if (dragStart.x !== 0 || dragStart.y !== 0) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragStart, dragOffset, isDragging, initialPosition, onPositionChange])

  return (
    <div 
      ref={cardRef}
      className="relative w-full h-full"
      style={{ 
        perspective: '1000px',
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        cursor: isDragging ? 'grabbing' : (isEditing ? 'default' : 'grab'),
        userSelect: 'none',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
      }}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="relative w-full h-full transition-all duration-700 hover:animate-wiggle"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side */}
        <div 
          className={`absolute inset-0 ${bgColor} rounded-[3.5px] flex items-center justify-center overflow-clip`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          data-name="Card - Front (Dark)" 
          data-node-id="48:15"
        >
          {/* Card Background */}
          <div 
            className={`absolute inset-0 ${bgColor} rounded-[3.5px]`}
            data-name="Card - Front (5' x 7')" 
            data-node-id="48:16" 
          />
          
          {/* Centered Cursor Logo - Scaled for square card */}
          <div 
            className="relative z-10 w-[41.349px] h-[46.688px] flex items-center justify-center"
            data-node-id="48:17"
          >
            <Image
              alt="Cursor Logo"
              src={imgFrame3}
              width={124}
              height={142}
              className="w-full h-full object-contain"
              style={{ filter: variant === 'light' ? 'invert(1)' : 'none' }}
              priority
            />
          </div>
        </div>

        {/* Back Side */}
        <div 
          className={`absolute inset-0 ${bgColor} rounded-[3.5px] overflow-clip flex items-center justify-center p-6`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          data-name="Card - Front (5' x 7')" 
          data-node-id="46:16"
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onClick={handleTextAreaClick}
            onKeyDown={handleKeyDown}
            readOnly={!isEditing}
            className={`w-full h-full bg-transparent border-none outline-none resize-none font-['Cursor_Gothic:Italic',sans-serif] italic leading-relaxed ${textColor} text-[16px] sm:text-[18px] md:text-[20px] text-center ${placeholderColor} placeholder:opacity-70 ${isEditing ? 'cursor-text' : 'cursor-pointer'}`}
            style={{
              caretColor: caretColor,
            }}
            placeholder="Type your message..."
            data-node-id="46:19"
          />
        </div>
      </div>
    </div>
  )
}
