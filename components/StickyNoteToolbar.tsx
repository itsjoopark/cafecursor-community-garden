'use client'

import { useState } from 'react'
import Image from 'next/image'

const cameraButtonSvg = "/assets/1109c83b75241c0d19af3a82d3a34a86aba2016e.svg"

interface StickyNoteToolbarProps {
  onColorSelect?: (color: 'dark' | 'light') => void
}

export default function StickyNoteToolbar({ onColorSelect }: StickyNoteToolbarProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleCameraClick = () => {
    setIsClicked(true)
    // Default to creating a white/light card (can be customized later)
    onColorSelect?.('light')
    
    // Visual feedback - reset after animation
    setTimeout(() => setIsClicked(false), 200)
  }

  return (
    <div 
      className="flex items-center justify-center touch-none select-none" 
      data-name="Frame_Photo_Capture_Button" 
      data-node-id="70:93"
    >
      <button
        onClick={handleCameraClick}
        className={`relative w-[70px] h-[70px] sm:w-[88px] sm:h-[88px] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer touch-auto ${
          isClicked ? 'scale-95' : ''
        }`}
        aria-label="Add polaroid card"
        title="Add new polaroid card"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Image
          src={cameraButtonSvg}
          alt="Camera button"
          width={88}
          height={88}
          className="w-full h-full drop-shadow-lg"
          priority
        />
      </button>
    </div>
  )
}

