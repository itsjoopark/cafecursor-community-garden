'use client'

import { useState, useRef, useEffect } from 'react'
import CursorCard from '@/components/CursorCard'
import StickyNoteToolbar from '@/components/StickyNoteToolbar'

interface Card {
  id: string
  variant: 'dark' | 'light'
  position: { x: number; y: number }
  text: string
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const MIN_ZOOM = 0.1
  const MAX_ZOOM = 3

  const handleAddCard = (variant: 'dark' | 'light') => {
    // Add cards at center of current viewport
    const newCard: Card = {
      id: `card-${Date.now()}-${Math.random()}`,
      variant,
      position: { 
        x: -canvasOffset.x + (Math.random() * 200 - 100), // Add in viewport center with slight offset
        y: -canvasOffset.y + (Math.random() * 200 - 100)
      },
      text: ''
    }
    setCards([...cards, newCard])
  }

  const handleCardPositionChange = (cardId: string, newPosition: { x: number; y: number }) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, position: newPosition } : card
    ))
  }

  const handleCardTextChange = (cardId: string, newText: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, text: newText } : card
    ))
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if clicking on the background layer or grid (not on cards)
    const target = e.target as HTMLElement
    const isCardOrChild = target.closest('[data-card-container]')
    
    if (!isCardOrChild) {
      setIsPanning(true)
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      })
      e.preventDefault()
    }
  }

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Check if touching on the background layer or grid (not on cards)
    const target = e.target as HTMLElement
    const isCardOrChild = target.closest('[data-card-container]')
    
    if (!isCardOrChild) {
      const touch = e.touches[0]
      setIsPanning(true)
      setPanStart({
        x: touch.clientX - canvasOffset.x,
        y: touch.clientY - canvasOffset.y,
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isPanning) {
      const touch = e.touches[0]
      setCanvasOffset({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      })
      e.preventDefault() // Prevent scrolling while panning
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    
    const delta = e.deltaY * -0.001
    const newZoom = Math.min(Math.max(zoom + delta, MIN_ZOOM), MAX_ZOOM)
    
    if (newZoom !== zoom) {
      // Get mouse position relative to viewport
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        
        // Calculate the point in world space before zoom
        const worldX = (mouseX - canvasOffset.x) / zoom
        const worldY = (mouseY - canvasOffset.y) / zoom
        
        // Calculate new offset to keep the same world point under the mouse
        const newOffsetX = mouseX - worldX * newZoom
        const newOffsetY = mouseY - worldY * newZoom
        
        setCanvasOffset({ x: newOffsetX, y: newOffsetY })
      }
      
      setZoom(newZoom)
    }
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, MAX_ZOOM)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, MIN_ZOOM)
    setZoom(newZoom)
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  useEffect(() => {
    if (isPanning) {
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
  }, [isPanning, panStart, canvasOffset])

  useEffect(() => {
    // Add wheel event listener for zooming
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      
      return () => {
        canvas.removeEventListener('wheel', handleWheel)
      }
    }
  }, [zoom, canvasOffset])

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-hidden">
      {/* Fixed Header - Anchored to top with 50px gap */}
      <div 
        className="fixed top-[50px] left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center p-[10px] rounded-[9px] bg-white/60 backdrop-blur-sm shadow-lg"
        data-node-id="48:29"
      >
        <h1 
          className="font-cursor-gothic-bold leading-normal not-italic text-[#14120b] text-[24px] sm:text-[28px] md:text-[30px] whitespace-nowrap"
          data-node-id="48:28"
        >
          Cafe Cursor Community Garden
        </h1>
      </div>

      {/* Infinite Canvas - Pannable Background */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 z-0"
        onMouseDown={handleCanvasMouseDown}
        onTouchStart={handleCanvasTouchStart}
      >
        {/* Solid Background Color */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: '#d0cac0',
            width: '100%',
            height: '100%',
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
        />
        
        {/* Dotted Grid Overlay for infinite canvas feel */}
        <div 
          className="absolute inset-0 origin-top-left"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(20, 18, 11, 0.35) 2px, transparent 2px)`,
            backgroundSize: `${100 * zoom}px ${100 * zoom}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
        />
        
        {/* Canvas Content - Cards Layer */}
        <div 
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
          }}
        >
          {/* Render all cards at their world positions */}
          {cards.map((card) => (
            <div 
              key={card.id}
              data-card-container
              className="absolute w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: `${card.position.x}px`,
                marginTop: `${card.position.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
              }}
            >
              <CursorCard 
                variant={card.variant}
                initialPosition={card.position}
                onPositionChange={(newPos) => handleCardPositionChange(card.id, newPos)}
                initialText={card.text}
                onTextChange={(newText) => handleCardTextChange(card.id, newText)}
              />
            </div>
          ))}

          {/* Instructions when no cards - centered in viewport */}
          {cards.length === 0 && (
            <div 
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
              style={{
                transform: 'none',
              }}
            >
              <div className="text-center px-4">
                <p className="text-[#14120b] text-xl sm:text-2xl font-medium opacity-70 mb-2">
                  Click a color in the toolbar below to add a sticky note
                </p>
                <p className="text-[#14120b] text-base sm:text-lg opacity-50">
                  Drag the background to pan around the infinite canvas
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls - Fixed at bottom right */}
      <div className="fixed bottom-[50px] right-[50px] z-30 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg w-12 h-12 flex items-center justify-center text-[#14120b] text-2xl font-bold hover:bg-white/80 transition-colors shadow-lg"
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleResetZoom}
          className="bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg w-12 h-12 flex items-center justify-center text-[#14120b] text-xs font-medium hover:bg-white/80 transition-colors shadow-lg"
          aria-label="Reset zoom"
          title="Reset zoom (100%)"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg w-12 h-12 flex items-center justify-center text-[#14120b] text-2xl font-bold hover:bg-white/80 transition-colors shadow-lg"
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
      </div>

      {/* Fixed Sticky Note Toolbar - Bottom with 50px gap */}
      <div className="fixed bottom-[50px] left-1/2 transform -translate-x-1/2 z-30">
        <StickyNoteToolbar onColorSelect={handleAddCard} />
      </div>
    </main>
  )
}
