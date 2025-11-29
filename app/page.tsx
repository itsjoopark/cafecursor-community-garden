'use client'

import { useState, useRef, useEffect } from 'react'
import PolaroidCard from '@/components/PolaroidCard'
import StickyNoteToolbar from '@/components/StickyNoteToolbar'

interface Card {
  id: string
  variant: 'dark' | 'light'
  position: { x: number; y: number }
  title: string
  description: string
  imageUrl: string
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null)
  const [isPinching, setIsPinching] = useState(false)
  const [isSpacebarHeld, setIsSpacebarHeld] = useState(false)
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
      title: 'Add Name',
      description: 'type a message',
      imageUrl: '/assets/178af05f21285175ff0b012f2a44f278cd7b626c.svg'
    }
    setCards([...cards, newCard])
  }

  const handleCardPositionChange = (cardId: string, newPosition: { x: number; y: number }) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, position: newPosition } : card
    ))
  }

  const handleCardTitleChange = (cardId: string, newTitle: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, title: newTitle } : card
    ))
  }

  const handleCardDescriptionChange = (cardId: string, newDescription: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, description: newDescription } : card
    ))
  }

  const handleCardImageChange = (cardId: string, newImageUrl: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, imageUrl: newImageUrl } : card
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
      if (e.touches.length === 2) {
        // Two finger pinch - initialize pinch-to-zoom
        setIsPinching(true)
        setIsPanning(false)
        const distance = getTouchDistance(e.touches[0], e.touches[1])
        setLastTouchDistance(distance)
      } else if (e.touches.length === 1) {
        // Single finger - initialize panning
        const touch = e.touches[0]
        setIsPanning(true)
        setIsPinching(false)
        setPanStart({
          x: touch.clientX - canvasOffset.x,
          y: touch.clientY - canvasOffset.y,
        })
      }
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

  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault()
      setIsPinching(true)
      setIsPanning(false)
      
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      
      if (lastTouchDistance !== null) {
        // Calculate zoom change
        const scale = distance / lastTouchDistance
        const newZoom = Math.min(Math.max(zoom * scale, MIN_ZOOM), MAX_ZOOM)
        
        if (newZoom !== zoom) {
          // Get pinch center relative to viewport
          const center = getTouchCenter(e.touches[0], e.touches[1])
          const rect = canvasRef.current?.getBoundingClientRect()
          
          if (rect) {
            const centerX = center.x - rect.left
            const centerY = center.y - rect.top
            
            // Calculate the point in world space before zoom
            const worldX = (centerX - canvasOffset.x) / zoom
            const worldY = (centerY - canvasOffset.y) / zoom
            
            // Calculate new offset to keep the same world point under the pinch center
            const newOffsetX = centerX - worldX * newZoom
            const newOffsetY = centerY - worldY * newZoom
            
            setCanvasOffset({ x: newOffsetX, y: newOffsetY })
          }
          
          setZoom(newZoom)
        }
      }
      
      setLastTouchDistance(distance)
    } else if (e.touches.length === 1 && isPanning && !isPinching) {
      // Single touch panning
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
    setIsPinching(false)
    setLastTouchDistance(null)
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

  const handleKeyDown = (e: KeyboardEvent) => {
    // Check if user is typing in an input field
    const target = e.target as HTMLElement
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
    
    if (e.code === 'Space' && !isInputField && !isSpacebarHeld) {
      e.preventDefault()
      setIsSpacebarHeld(true)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      setIsSpacebarHeld(false)
      setIsPanning(false)
    }
  }

  const handleSpacebarMouseDown = (e: React.MouseEvent) => {
    if (isSpacebarHeld) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      })
    }
  }

  useEffect(() => {
    if (isPanning || isPinching) {
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
  }, [isPanning, isPinching, panStart, canvasOffset, zoom, lastTouchDistance])

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

  useEffect(() => {
    // Add keyboard event listeners for spacebar panning
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isSpacebarHeld])

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
        style={{ 
          touchAction: 'none',
          cursor: isSpacebarHeld ? (isPanning ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={(e) => {
          if (isSpacebarHeld) {
            handleSpacebarMouseDown(e)
          } else {
            handleCanvasMouseDown(e)
          }
        }}
        onTouchStart={handleCanvasTouchStart}
      >
        {/* Solid Background Color */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: '#F0EFEA',
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
            cursor: (isPanning || isSpacebarHeld) ? (isPanning ? 'grabbing' : 'grab') : 'default',
          }}
        />
        
        {/* Canvas Content - Cards Layer */}
        <div 
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
          }}
        >
          {/* Render all Polaroid cards at their world positions */}
          {cards.map((card) => (
            <div 
              key={card.id}
              data-card-container
              className="absolute w-[232px] md:w-[281px] h-[275px] md:h-[333.221px]"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: `${card.position.x}px`,
                marginTop: `${card.position.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
              }}
            >
              <PolaroidCard 
                initialPosition={card.position}
                onPositionChange={(newPos) => handleCardPositionChange(card.id, newPos)}
                initialTitle={card.title}
                initialDescription={card.description}
                initialImageUrl={card.imageUrl}
                onTitleChange={(newTitle) => handleCardTitleChange(card.id, newTitle)}
                onDescriptionChange={(newDesc) => handleCardDescriptionChange(card.id, newDesc)}
                onImageChange={(newImageUrl) => handleCardImageChange(card.id, newImageUrl)}
                isSelected={draggingCardId === card.id}
                onDragStart={() => setDraggingCardId(card.id)}
                onDragEnd={() => setDraggingCardId(null)}
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
                  Click a color in the toolbar below to add a polaroid card
                </p>
                <p className="text-[#14120b] text-base sm:text-lg opacity-50">
                  Drag the background to pan around the infinite canvas
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls - Fixed at bottom right - Closer to edge on mobile */}
      <div className="fixed bottom-[50px] right-[20px] md:right-[50px] z-30 flex flex-col gap-2">
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

      {/* Fixed Camera Button Toolbar - Bottom with 50px gap */}
      <div className="fixed bottom-[50px] left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <StickyNoteToolbar onColorSelect={handleAddCard} />
      </div>
    </main>
  )
}
