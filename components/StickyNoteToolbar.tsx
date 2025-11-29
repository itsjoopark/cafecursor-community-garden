'use client'

import { useState } from 'react'

const downloadIconSvg = "/assets/1f5e18bb658df130d97358214af44a30430f86b5.svg"
const cameraIconSvg = "/assets/d9eec57cf74a07d845d166bffa08534eca923ea5.svg"
const shareIconSvg = "/assets/8b61fb9c976be6754b86ffc5fb4c0cae3073a233.svg"

interface StickyNoteToolbarProps {
  onColorSelect?: (color: 'dark' | 'light') => void
  onCameraClick?: () => void
}

export default function StickyNoteToolbar({ onColorSelect, onCameraClick }: StickyNoteToolbarProps) {
  const [clickedIcon, setClickedIcon] = useState<'download' | 'camera' | 'share' | null>(null)

  const handleCameraClick = () => {
    setClickedIcon('camera')
    
    // Trigger file input and set card variant
    onCameraClick?.()
    onColorSelect?.('light')
    
    // Visual feedback - reset after animation
    setTimeout(() => setClickedIcon(null), 200)
  }

  const handleDownloadClick = () => {
    setClickedIcon('download')
    // TODO: Implement download functionality
    console.log('Download clicked')
    setTimeout(() => setClickedIcon(null), 200)
  }

  const handleShareClick = () => {
    setClickedIcon('share')
    // TODO: Implement share functionality
    console.log('Share clicked')
    setTimeout(() => setClickedIcon(null), 200)
  }

  return (
    <div 
      className="border border-[#bfbfbf] border-solid box-border flex gap-[25px] items-center p-[10px] rounded-[10px] bg-white"
      data-node-id="75:337"
    >
      {/* Download Icon */}
      <button
        type="button"
        onClick={handleDownloadClick}
        className={`relative shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
          clickedIcon === 'download' ? 'scale-95' : ''
        }`}
        style={{ 
          width: '15.679px', 
          height: '15.052px',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
        aria-label="Download"
        title="Download"
        data-node-id="75:296"
      >
        <img
          src={downloadIconSvg}
          alt="Download"
          className="block w-full h-full"
        />
      </button>

      {/* Camera Icon - Photo Upload/Capture */}
      <button
        type="button"
        onClick={handleCameraClick}
        onTouchEnd={(e) => {
          e.preventDefault()
          handleCameraClick()
        }}
        className={`relative shrink-0 overflow-clip transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
          clickedIcon === 'camera' ? 'scale-95' : ''
        }`}
        style={{ 
          width: '20px', 
          height: '20px',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
        aria-label="Take or upload photo"
        title="Take or upload photo"
        data-name="camera"
        data-node-id="75:312"
      >
        <img
          src={cameraIconSvg}
          alt="Camera"
          className="block w-full h-full"
        />
      </button>

      {/* Share Icon */}
      <button
        type="button"
        onClick={handleShareClick}
        className={`relative shrink-0 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
          clickedIcon === 'share' ? 'scale-95' : ''
        }`}
        style={{ 
          width: '20.952px', 
          height: '20.952px',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
        aria-label="Share"
        title="Share"
        data-node-id="75:311"
      >
        <div style={{ transform: 'rotate(54deg)' }}>
          <img
            src={shareIconSvg}
            alt="Share"
            style={{ width: '15px', height: '14.999px' }}
          />
        </div>
      </button>
    </div>
  )
}

