'use client'

import { useState } from 'react'
import Image from 'next/image'

const plusIconSvg = "/assets/74224aa9f9e99b3b3edfcd2ed0af8004567f8b60.svg"

interface StickyNoteToolbarProps {
  onColorSelect?: (color: 'dark' | 'light') => void
  onCameraClick?: () => void
}

export default function StickyNoteToolbar({ onColorSelect, onCameraClick }: StickyNoteToolbarProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleAddClick = () => {
    setIsClicked(true)
    
    // Call both handlers - triggers file input and sets card variant
    onCameraClick?.()
    onColorSelect?.('light')
    
    // Visual feedback - reset after animation
    setTimeout(() => setIsClicked(false), 200)
  }

  return (
    <div 
      className="border border-[#bfbfbf] border-solid box-border flex flex-col gap-[10px] p-[10px] rounded-[8px] bg-white"
      data-name="Frame_Add_Polaroid" 
      data-node-id="72:140"
    >
      <div 
        className="flex gap-[20px] items-center"
        data-name="Frame_Clickable_Modes" 
        data-node-id="72:141"
      >
        <button
          type="button"
          onClick={handleAddClick}
          onTouchEnd={(e) => {
            e.preventDefault()
            handleAddClick()
          }}
          className={`relative size-[24px] overflow-clip flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
            isClicked ? 'scale-95' : ''
          }`}
          aria-label="Add new polaroid"
          title="Add new polaroid"
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          data-name="plus"
          data-node-id="75:175"
        >
          <div className="relative size-full">
            <Image
              src={plusIconSvg}
              alt="Add"
              width={24}
              height={24}
              className="w-full h-full"
              priority
            />
          </div>
        </button>
      </div>
    </div>
  )
}

