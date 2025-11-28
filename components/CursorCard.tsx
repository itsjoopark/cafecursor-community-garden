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
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Color variants
  const bgColor = variant === 'dark' ? 'bg-[#14120b]' : 'bg-[#f0efea]'

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
    setDragOffset({ x: 0, y: 0 })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
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

  const handleTouchMove = (e: TouchEvent) => {
    if (dragStart.x !== 0 || dragStart.y !== 0) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - dragStart.x
      const deltaY = touch.clientY - dragStart.y
      
      // If moved more than 5px, consider it a drag
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIsDragging(true)
        e.preventDefault() // Prevent scrolling while dragging
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
    
    // Reset dragging state after a short delay
    setTimeout(() => setIsDragging(false), 100)
  }

  const handleTouchEnd = () => {
    if (isDragging && onPositionChange) {
      // Report final position change to parent
      onPositionChange({
        x: initialPosition.x + dragOffset.x,
        y: initialPosition.y + dragOffset.y,
      })
    }
    
    setDragStart({ x: 0, y: 0 })
    setDragOffset({ x: 0, y: 0 })
    
    // Reset dragging state after a short delay
    setTimeout(() => setIsDragging(false), 100)
  }

  useEffect(() => {
    // Add global mouse and touch event listeners for dragging
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
      className="relative w-full h-full touch-none"
      style={{ 
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div 
        className="relative w-full h-full hover:animate-wiggle"
      >
        {/* Card */}
        <div 
          className={`absolute inset-0 ${bgColor} rounded-[3.5px] flex items-center justify-center overflow-clip`}
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
      </div>
    </div>
  )
}
