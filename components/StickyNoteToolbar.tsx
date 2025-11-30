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
      className={`border border-[#bfbfbf] border-solid box-border flex items-center justify-center w-12 h-12 rounded-[10px] bg-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
        isPressed ? 'scale-95' : ''
      }`}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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

