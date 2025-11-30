'use client'

import { useState, useRef, useEffect } from 'react'
import PolaroidCard from '@/components/PolaroidCard'
import StickyNoteToolbar from '@/components/StickyNoteToolbar'
import { uploadImage, saveCard, updateCard, deleteCard, getAllCards, subscribeToCards, subscribeToDragging, broadcastDragging } from '@/lib/supabase'

interface Card {
  id: string
  variant: 'dark' | 'light'
  position: { x: number; y: number }
  title: string
  description: string
  imageUrl: string
  dateStamp?: string
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingCardVariant = useRef<'dark' | 'light' | null>(null)
  const lastBroadcastTime = useRef<number>(0)
  
  // Generate a unique user ID for this session
  const userId = useRef<string>('')
  if (!userId.current) {
    userId.current = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  const MIN_ZOOM = 0.1
  const MAX_ZOOM = 3

  const handleCameraButtonClick = () => {
    // Trigger file input immediately on button click for mobile compatibility
    fileInputRef.current?.click()
  }

  const handleAddCard = (variant: 'dark' | 'light') => {
    // Store the variant for when the image is selected
    pendingCardVariant.current = variant
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && pendingCardVariant.current) {
      try {
        // Generate unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(7)
        const fileName = `polaroid-${timestamp}-${randomId}.${file.name.split('.').pop()}`
        
        // Upload image to Supabase Storage
        const imageUrl = await uploadImage(file, fileName)
        
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.')
          e.target.value = ''
          return
        }
        
        // Generate date stamp
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const year = now.getFullYear()
        const dateStamp = `${month}/${day}/${year}`
        
        // Calculate viewport center and convert to world coordinates
        const viewportCenterX = window.innerWidth / 2
        const viewportCenterY = window.innerHeight / 2
        
        // Convert viewport coordinates to world space (accounting for pan and zoom)
        const worldX = (viewportCenterX - canvasOffset.x) / zoom
        const worldY = (viewportCenterY - canvasOffset.y) / zoom
        
        // Create card with the uploaded image and date stamp
        const newCard: Card = {
          id: `card-${timestamp}-${randomId}`,
          variant: pendingCardVariant.current!,
          position: { 
            x: worldX,
            y: worldY
          },
          title: '',
          description: '',
          imageUrl: imageUrl,
          dateStamp: dateStamp
        }
        
        // Save card to database
        const saved = await saveCard({
          id: newCard.id,
          variant: newCard.variant,
          position_x: newCard.position.x,
          position_y: newCard.position.y,
          title: newCard.title,
          description: newCard.description,
          image_url: newCard.imageUrl,
          date_stamp: newCard.dateStamp || ''
        })
        
        if (saved) {
          // Add card to local state (will also be received via real-time subscription)
          setCards([...cards, newCard])
        } else {
          alert('Failed to save card. Please try again.')
        }
        
        // Reset pending variant
        pendingCardVariant.current = null
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image. Please try again.')
      }
    }
    
    // Reset file input so the same file can be selected again
    e.target.value = ''
  }

  const handleCardPositionChange = async (cardId: string, newPosition: { x: number; y: number }) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, position: newPosition } : card
    ))
    
    // Broadcast position in real-time while dragging (throttled to 50ms)
    const now = Date.now()
    if (now - lastBroadcastTime.current > 50) {
      broadcastDragging(cardId, newPosition, userId.current)
      lastBroadcastTime.current = now
    }
    
    // Update in database (this will also trigger real-time sync for other users)
    await updateCard(cardId, {
      position_x: newPosition.x,
      position_y: newPosition.y
    })
  }

  const handleCardTitleChange = async (cardId: string, newTitle: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, title: newTitle } : card
    ))
    
    // Update in database
    await updateCard(cardId, { title: newTitle })
  }

  const handleCardDescriptionChange = async (cardId: string, newDescription: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, description: newDescription } : card
    ))
    
    // Update in database
    await updateCard(cardId, { description: newDescription })
  }

  const handleCardImageChange = async (cardId: string, newImageUrl: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, imageUrl: newImageUrl } : card
    ))
    
    // Update in database
    await updateCard(cardId, { image_url: newImageUrl })
  }

  const handleCardDelete = async (cardId: string) => {
    // Remove from local state immediately for better UX
    setCards(cards.filter(card => card.id !== cardId))
    
    // Delete from database
    await deleteCard(cardId)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle clicks that are directly on the canvas/background
    // Clicks on cards will be stopped at the card level
    setIsPanning(true)
    setPanStart({
      x: e.clientX - canvasOffset.x,
      y: e.clientY - canvasOffset.y,
    })
    e.preventDefault()
  }

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only handle touch events that are directly on the canvas/background
    // Touch events on cards will be stopped at the card level
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

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => {
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

  // Load all cards from database on mount
  useEffect(() => {
    const loadCards = async () => {
      const dbCards = await getAllCards()
      const formattedCards: Card[] = dbCards.map(dbCard => ({
        id: dbCard.id,
        variant: dbCard.variant,
        position: { x: dbCard.position_x, y: dbCard.position_y },
        title: dbCard.title,
        description: dbCard.description,
        imageUrl: dbCard.image_url,
        dateStamp: dbCard.date_stamp
      }))
      setCards(formattedCards)
    }
    
    loadCards()

    // Subscribe to real-time card changes (INSERT, UPDATE, DELETE)
    const unsubscribe = subscribeToCards(
      // On INSERT - add new card
      (newCard) => {
        setCards(prevCards => {
          // Check if card already exists (avoid duplicates)
          if (prevCards.some(c => c.id === newCard.id)) {
            return prevCards
          }
          
          console.log('🆕 New card added by another user:', newCard.id)
          
          // Add new card from real-time subscription
          return [...prevCards, {
            id: newCard.id,
            variant: newCard.variant,
            position: { x: newCard.position_x, y: newCard.position_y },
            title: newCard.title,
            description: newCard.description,
            imageUrl: newCard.image_url,
            dateStamp: newCard.date_stamp
          }]
        })
      },
      // On UPDATE - update existing card
      (updatedCard) => {
        setCards(prevCards => {
          console.log('✏️ Card updated by another user:', updatedCard.id)
          
          return prevCards.map(card =>
            card.id === updatedCard.id
              ? {
                  ...card,
                  variant: updatedCard.variant,
                  position: { x: updatedCard.position_x, y: updatedCard.position_y },
                  title: updatedCard.title,
                  description: updatedCard.description,
                  imageUrl: updatedCard.image_url,
                  dateStamp: updatedCard.date_stamp
                }
              : card
          )
        })
      },
      // On DELETE - remove card
      (deletedCardId) => {
        setCards(prevCards => {
          console.log('🗑️ Card deleted by another user:', deletedCardId)
          return prevCards.filter(card => card.id !== deletedCardId)
        })
      }
    )

    // Subscribe to real-time dragging (see positions update while others drag)
    const unsubscribeDragging = subscribeToDragging((data) => {
      // Only update if it's not the current user dragging
      if (data.userId !== userId.current) {
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === data.cardId
              ? { ...card, position: data.position }
              : card
          )
        )
      }
    })

    return () => {
      unsubscribe()
      unsubscribeDragging()
    }
  }, [])

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-hidden">
      {/* Fixed Header - New Design with Logo and Cafe Name */}
      <div 
        className="fixed top-[50px] left-1/2 transform -translate-x-1/2 z-30 flex flex-col gap-[5px] items-center"
        data-node-id="75:266"
      >
        {/* Cursor Logo */}
        <div 
          className="relative shrink-0"
          style={{ width: '92px', height: '22px' }}
          data-name="LOCKUP_HORIZONTAL_2D_LIGHT 2"
          data-node-id="75:255"
        >
          <img 
            src="/assets/3c804cdd48f91d0375989343f0e5a7f464a3f595.svg"
            alt="Cursor Logo"
            className="block w-full h-full"
          />
        </div>

        {/* Cafe Name - No Background */}
        <div 
          className="box-border flex gap-[10px] items-center justify-center px-[10px] py-[5px]"
          data-node-id="72:154"
        >
          <h1 
            className="italic leading-normal relative shrink-0 text-[#14120b] text-[30px] whitespace-nowrap"
            style={{ fontFamily: "'Bodoni 72', 'Bodoni MT', Georgia, serif" }}
            data-node-id="72:155"
          >
            Cafe Cursor Toronto
          </h1>
        </div>

        {/* Spacer for Visual Balance */}
        <div 
          className="shrink-0"
          style={{ width: '92px', height: '22px' }}
          data-node-id="75:264"
        />
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
            backgroundImage: `radial-gradient(circle, rgba(20, 18, 11, ${Math.max(0.08, Math.min(0.35, zoom * 0.35))}) 2px, transparent 2px)`,
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
              data-card-id={card.id}
              className="absolute w-[232px] md:w-[281px] h-[275px] md:h-[333.221px]"
              style={{
                left: `${card.position.x}px`,
                top: `${card.position.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                // Smooth transition for position changes from other users
                // Disable transition when this card is being dragged by current user
                transition: draggingCardId === card.id ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out',
              }}
              onMouseDown={(e) => {
                // Stop propagation to prevent canvas panning when clicking cards (desktop)
                e.stopPropagation()
              }}
              onTouchStart={(e) => {
                // Stop propagation to prevent canvas panning when touching cards (mobile)
                e.stopPropagation()
              }}
            >
              <PolaroidCard 
                initialPosition={card.position}
                onPositionChange={(newPos) => handleCardPositionChange(card.id, newPos)}
                initialTitle={card.title}
                initialDescription={card.description}
                initialImageUrl={card.imageUrl}
                initialDateStamp={card.dateStamp}
                onTitleChange={(newTitle) => handleCardTitleChange(card.id, newTitle)}
                onDescriptionChange={(newDesc) => handleCardDescriptionChange(card.id, newDesc)}
                onImageChange={(newImageUrl) => handleCardImageChange(card.id, newImageUrl)}
                onDelete={() => handleCardDelete(card.id)}
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
                <p className="text-[#14120b] text-base sm:text-lg opacity-50">
                  Drag the canvas to move around
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Canvas Button - Fixed at bottom left */}
      <div className="fixed bottom-[50px] left-[20px] md:left-[50px] z-30">
        <button
          onClick={() => alert('Save Canvas feature - Coming soon!')}
          className="bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg w-12 h-12 flex items-center justify-center text-[#14120b] font-['Cursor_Gothic:Regular',sans-serif] text-[21px] hover:bg-white/80 transition-colors shadow-lg"
          aria-label="Save canvas"
          title="Save canvas"
        >
          ⤓
        </button>
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
        <StickyNoteToolbar 
          onColorSelect={handleAddCard}
          onCameraClick={handleCameraButtonClick}
        />
      </div>

      {/* Hidden File Input for Photo Upload - Mobile Camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ 
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 1,
          height: 1
        }}
        aria-label="Capture or upload photo"
      />
    </main>
  )
}
