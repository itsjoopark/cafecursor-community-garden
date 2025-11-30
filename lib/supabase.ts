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
  created_at: string
}

// Upload image to Supabase Storage
export async function uploadImage(file: File | Blob, fileName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('polaroid-images')
      .upload(fileName, file, {
        cacheControl: '3600',
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

// Get all cards from database
export async function getAllCards(): Promise<Card[]> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })

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

// Subscribe to real-time changes
export function subscribeToCards(callback: (card: Card) => void) {
  const channel = supabase
    .channel('cards-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'cards' },
      (payload) => {
        callback(payload.new as Card)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

