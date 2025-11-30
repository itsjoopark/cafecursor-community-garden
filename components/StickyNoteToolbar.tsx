'use client'

import { useState } from 'react'

const cameraIconSvg = "/assets/d9eec57cf74a07d845d166bffa08534eca923ea5.svg"

interface StickyNoteToolbarProps {
  onColorSelect?: (color: 'dark' | 'light') => void
  onCameraClick?: () => void
}

export default function StickyNoteToolbar({ onColorSelect, onCameraClick }: StickyNoteToolbarProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleCameraClick = () => {
    setIsPressed(true)
    
    // Trigger file input and set card variant
    onCameraClick?.()
    onColorSelect?.('light')
    
    // Visual feedback - reset after animation
    setTimeout(() => setIsPressed(false), 200)
  }

  return (
    <button
      type="button"
      onClick={handleCameraClick}
      onTouchEnd={(e) => {
        e.preventDefault()
        handleCameraClick()
      }}
      className={`bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg w-12 h-12 flex items-center justify-center hover:bg-white/80 transition-colors shadow-lg cursor-pointer ${
        isPressed ? 'scale-95' : ''
      }`}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
      aria-label="Take or upload photo"
      title="Take or upload photo"
      data-node-id="75:337"
    >
      {/* Camera Icon */}
      <div 
        className="overflow-clip relative shrink-0 w-[20px] h-[20px]"
        data-name="camera"
        data-node-id="75:312"
      >
        <img
          src={cameraIconSvg}
          alt="Camera"
          className="block w-full h-full object-contain"
        />
      </div>
    </button>
  )
}

