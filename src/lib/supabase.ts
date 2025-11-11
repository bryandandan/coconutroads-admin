import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Van {
  id: string
  name: string
  description: string | null
  capacity: number
  price_per_day: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  van_id: string | null
  surname_and_name: string
  email: string
  birth_date: string
  telephone: string
  nationality: string
  departure_date: string
  return_date: string
  requests: string | null
  terms_accepted: boolean
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  admin_notes: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface BookingStatusHistory {
  id: string
  booking_id: string
  old_status: string | null
  new_status: string
  changed_by: string | null
  notes: string | null
  created_at: string
}
