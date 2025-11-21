import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export enum type from database
export type BookingStatus = Database['public']['Enums']['booking_status']

// Types derived from database schema
export type Van = Database['public']['Tables']['vans']['Row']
export type VanInsert = Database['public']['Tables']['vans']['Insert']
export type VanUpdate = Database['public']['Tables']['vans']['Update']

export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']

export type BookingStatusHistory = Database['public']['Tables']['booking_status_history']['Row']
export type BookingStatusHistoryInsert = Database['public']['Tables']['booking_status_history']['Insert']
export type BookingStatusHistoryUpdate = Database['public']['Tables']['booking_status_history']['Update']

export type BlockedDate = Database['public']['Tables']['blocked_dates']['Row']
export type BlockedDateInsert = Database['public']['Tables']['blocked_dates']['Insert']
export type BlockedDateUpdate = Database['public']['Tables']['blocked_dates']['Update']
