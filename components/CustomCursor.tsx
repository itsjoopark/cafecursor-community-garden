'use client'

import { useState, useEffect } from 'react'

const cursorIcon = "/assets/4d511e8491dcfb5bbcdcade91e90151c344502b6.png"

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show custom cursor on desktop (not on mobile/touch devices)
    const isDesktop = window.matchMedia('(min-width: 768px) and (hover: hover)').matches
    if (!isDesktop) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [])

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isVisible ? 1 : 0,
        transform: 'translate(0, 0)',
      }}
    >
      {/* Custom Cursor Arrow */}
      <div className="relative" style={{ width: '24px', height: '24px' }}>
        <div 
          className="absolute" 
          style={{
            height: '17.578px',
            left: 'calc(50% + 0.71px)',
            top: 'calc(50% - 0.21px)',
            transform: 'translate(-50%, -50%)',
            width: '11.414px'
          }}
        >
          <div className="absolute" style={{ inset: '-4.55% -15.77% -15.93% -15.77%' }}>
            <img 
              alt="" 
              className="block max-w-none size-full" 
              src={cursorIcon}
              style={{ 
                filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

