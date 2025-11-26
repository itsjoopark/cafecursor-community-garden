'use client'

import { useState } from 'react'

interface StickyNoteToolbarProps {
  onColorSelect?: (color: 'dark' | 'light') => void
}

export default function StickyNoteToolbar({ onColorSelect }: StickyNoteToolbarProps) {
  const [lastClicked, setLastClicked] = useState<'dark' | 'light' | null>(null)

  const handleColorClick = (color: 'dark' | 'light') => {
    setLastClicked(color)
    onColorSelect?.(color)
    
    // Visual feedback - reset after animation
    setTimeout(() => setLastClicked(null), 200)
  }

  return (
    <div 
      className="border border-[#f0efea] border-solid box-border flex flex-col gap-[10px] p-[10px] rounded-[8px] bg-[#d4cdb8]/80 backdrop-blur-sm" 
      data-name="Frame_Add_Stickie_Note" 
      data-node-id="49:83"
    >
      <div 
        className="flex gap-[10px] items-center" 
        data-name="Frame_Clickable_Modes" 
        data-node-id="49:80"
      >
        {/* Dark/Black Card Option */}
        <button
          onClick={() => handleColorClick('dark')}
          className={`bg-[#14120b] rounded-[6px] size-[39px] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
            lastClicked === 'dark' ? 'ring-2 ring-[#f0efea] ring-offset-2 ring-offset-[#d4cdb8] scale-95' : ''
          }`}
          data-node-id="49:81"
          aria-label="Add dark card"
          title="Add dark sticky note"
        />
        
        {/* Light/White Card Option */}
        <button
          onClick={() => handleColorClick('light')}
          className={`bg-[#f0efea] rounded-[6px] size-[39px] transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
            lastClicked === 'light' ? 'ring-2 ring-[#14120b] ring-offset-2 ring-offset-[#d4cdb8] scale-95' : ''
          }`}
          data-node-id="49:82"
          aria-label="Add light card"
          title="Add light sticky note"
        />
      </div>
    </div>
  )
}

