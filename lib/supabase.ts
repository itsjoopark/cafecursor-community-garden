import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for type safety
export interface Card {
  id: string
  variant: 'dark' | 'light'
  position_x: number
  position_y: number
  title: string
  description: string
  image_url: string
  date_stamp: string
  overlay_text?: string
  created_at: string
}

// Compress image before upload for better performance
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Max dimensions for polaroid cards
        const MAX_WIDTH = 1200
        const MAX_HEIGHT = 1200
        
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height
            height = MAX_HEIGHT
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with compression (0.85 quality = good balance)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          0.85
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
  })
}

// Upload image to Supabase Storage with compression
export async function uploadImage(file: File | Blob, fileName: string): Promise<string | null> {
  try {
    // Compress the image before uploading
    let fileToUpload: Blob = file
    if (file instanceof File && file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImage(file)
        console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`)
      } catch (error) {
        console.warn('Image compression failed, uploading original:', error)
        fileToUpload = file
      }
    }

    const { data, error } = await supabase.storage
      .from('polaroid-images')
      .upload(fileName, fileToUpload, {
        cacheControl: '31536000', // 1 year cache for better performance
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('polaroid-images')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

// Get optimized image URL with Supabase transformations
export function getOptimizedImageUrl(imageUrl: string, options?: {
  width?: number
  height?: number
  quality?: number
}): string {
  // If it's not a Supabase storage URL, return as-is
  if (!imageUrl.includes('supabase')) {
    return imageUrl
  }

  const { width = 600, height = 600, quality = 80 } = options || {}
  
  // Add Supabase image transformation parameters
  const url = new URL(imageUrl)
  url.searchParams.set('width', width.toString())
  url.searchParams.set('height', height.toString())
  url.searchParams.set('quality', quality.toString())
  url.searchParams.set('resize', 'contain') // Maintain aspect ratio
  
  return url.toString()
}

// Save card to database
export async function saveCard(card: Omit<Card, 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cards')
      .insert([{
        id: card.id,
        variant: card.variant,
        position_x: card.position_x,
        position_y: card.position_y,
        title: card.title,
        description: card.description,
        image_url: card.image_url,
        date_stamp: card.date_stamp
      }])

    if (error) {
      console.error('Error saving card:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error saving card:', error)
    return false
  }
}

// Update card in database
export async function updateCard(cardId: string, updates: Partial<Omit<Card, 'id' | 'created_at'>>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)

    if (error) {
      console.error('Error updating card:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating card:', error)
    return false
  }
}

// Delete card from database
export async function deleteCard(cardId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Error deleting card:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting card:', error)
    return false
  }
}

// Get all cards from database with optional limit for performance
export async function getAllCards(limit?: number): Promise<Card[]> {
  try {
    let query = supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Apply limit if specified for better performance on initial load
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching cards:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching cards:', error)
    return []
  }
}

// Get card count for pagination
export async function getCardCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error fetching card count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching card count:', error)
    return 0
  }
}

// Subscribe to real-time changes (INSERT, UPDATE, DELETE)
export function subscribeToCards(
  onInsert: (card: Card) => void,
  onUpdate: (card: Card) => void,
  onDelete: (cardId: string) => void
) {
  const channel = supabase
    .channel('cards-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'cards' },
      (payload) => {
        console.log('Real-time INSERT:', payload.new)
        onInsert(payload.new as Card)
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'cards' },
      (payload) => {
        console.log('Real-time UPDATE:', payload.new)
        onUpdate(payload.new as Card)
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'cards' },
      (payload) => {
        console.log('Real-time DELETE:', payload.old)
        onDelete((payload.old as Card).id)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Subscribe to real-time card positions (for live dragging - optional)
export function subscribeToDragging(
  onDragUpdate: (data: { cardId: string; position: { x: number; y: number }; userId: string }) => void
) {
  const channel = supabase
    .channel('card-dragging')
    .on('broadcast', { event: 'card-drag' }, (payload) => {
      onDragUpdate(payload.payload as { cardId: string; position: { x: number; y: number }; userId: string })
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Broadcast card dragging position (for live dragging - optional)
export function broadcastDragging(cardId: string, position: { x: number; y: number }, userId: string) {
  supabase.channel('card-dragging').send({
    type: 'broadcast',
    event: 'card-drag',
    payload: { cardId, position, userId }
  })
}

