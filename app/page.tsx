'use client'

import { useState, useRef, useEffect } from 'react'
import CursorCard from '@/components/CursorCard'
import StickyNoteToolbar from '@/components/StickyNoteToolbar'
import Image from 'next/image'

const backgroundImage = "/assets/bf81fb310ab67aad2f37c27fd1bf667e26c403bc.png"

interface Card {
  id: string
  variant: 'dark' | 'light'
  position: { x: number; y: number }
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleAddCard = (variant: 'dark' | 'light') => {
    // Add cards at center of current viewport
    const newCard: Card = {
      id: `card-${Date.now()}-${Math.random()}`,
      variant,
      position: { 
        x: -canvasOffset.x + (Math.random() * 200 - 100), // Add in viewport center with slight offset
        y: -canvasOffset.y + (Math.random() * 200 - 100)
      }
    }
    setCards([...cards, newCard])
  }

  const handleCardPositionChange = (cardId: string, newPosition: { x: number; y: number }) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, position: newPosition } : card
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

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isPanning, panStart, canvasOffset])

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-hidden">
      {/* Fixed Header - Anchored to top with 50px gap */}
      <div 
        className="fixed top-[50px] left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center p-[10px] rounded-[9px] bg-[#d4cdb8]/80 backdrop-blur-sm"
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
        className="absolute inset-0 z-0 touch-none"
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Tiled Background Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: '1728px 1117px',
            backgroundRepeat: 'repeat',
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
            width: '100%',
            height: '100%',
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
        />
        
        {/* Subtle Grid Overlay for infinite canvas feel */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(20, 18, 11, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(20, 18, 11, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            backgroundPosition: `${canvasOffset.x % 100}px ${canvasOffset.y % 100}px`,
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
        />
        
        {/* Canvas Content - Cards Layer */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
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

      {/* Fixed Sticky Note Toolbar - Bottom with 50px gap */}
      <div className="fixed bottom-[50px] left-1/2 transform -translate-x-1/2 z-30">
        <StickyNoteToolbar onColorSelect={handleAddCard} />
      </div>
    </main>
  )
}
