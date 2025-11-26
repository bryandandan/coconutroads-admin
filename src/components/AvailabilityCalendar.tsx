'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { format, parseISO, isWithinInterval, startOfDay } from 'date-fns'
import type { DayButton } from 'react-day-picker'
import { cn } from '@/lib/utils'

// Embedded types for standalone use
interface BlockedDate {
  id: string
  start_date: string
  end_date: string
  reason: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Configuration - set these environment variables in your project
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Standalone availability calendar component
 *
 * This component reads blocked dates from the Supabase database and displays
 * them on a calendar. It requires no props and can be copy-pasted to any project.
 *
 * Requirements:
 * - Supabase project with a 'blocked_dates' table
 * - NEXT_PUBLIC_SUPABASE_URL environment variable
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable
 * - date-fns package
 * - react-day-picker package (via shadcn/ui calendar component)
 *
 * Database schema:
 * CREATE TABLE blocked_dates (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   start_date DATE NOT NULL,
 *   end_date DATE NOT NULL,
 *   reason TEXT,
 *   created_by TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
 * );
 */
export default function AvailabilityCalendar() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    fetchBlockedDates()
  }, [])

  const fetchBlockedDates = async () => {
    setLoading(true)
    try {
      // Create Supabase client directly (no import needed)
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      const { data, error } = await supabase.from('blocked_dates').select('*').order('start_date', { ascending: true })

      if (error) throw error

      setBlockedDates(data || [])
    } catch (error) {
      console.error('Error fetching blocked dates:', error)
    } finally {
      setLoading(false)
    }
  }

  const isDateBlocked = (date: Date): boolean => {
    const dateStart = startOfDay(date)
    return blockedDates.some(blocked => {
      const startDate = startOfDay(parseISO(blocked.start_date))
      const endDate = startOfDay(parseISO(blocked.end_date))
      return isWithinInterval(dateStart, { start: startDate, end: endDate })
    })
  }

  const getBlockedReasonForDate = (date: Date): string | null => {
    const dateStart = startOfDay(date)
    const blocked = blockedDates.find(b => {
      const startDate = startOfDay(parseISO(b.start_date))
      const endDate = startOfDay(parseISO(b.end_date))
      return isWithinInterval(dateStart, { start: startDate, end: endDate })
    })
    return blocked?.reason || null
  }

  // Custom day button that shows blocked dates in red, available dates in green, and past dates greyed out
  const CustomDayButton = (props: React.ComponentProps<typeof DayButton>) => {
    const blocked = isDateBlocked(props.day.date)
    const isPast = startOfDay(props.day.date) < startOfDay(new Date())

    return (
      // <div className="p-0.5">
      <CalendarDayButton
        {...props}
        className={cn(
          props.className,
          isPast
            ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 opacity-50'
            : blocked
            ? 'bg-red-100 text-red-900 hover:bg-red-200 data-[selected-single=true]:bg-red-500 data-[selected-single=true]:text-white'
            : 'bg-green-100 text-green-900 hover:bg-green-200 data-[selected-single=true]:bg-green-500 data-[selected-single=true]:text-white'
        )}
      />
      // </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading calendar...</p>
      </div>
    )
  }

  const blocked = selectedDate ? isDateBlocked(selectedDate) : false
  const blockedReason = selectedDate ? getBlockedReasonForDate(selectedDate) : null

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm">Unavailable</span>
        </div>
      </div>

      <div style={{ '--cell-size': '2.5rem' } as React.CSSProperties}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          components={{
            DayButton: CustomDayButton
          }}
          weekStartsOn={1}
          className="rounded-md border shadow-sm"
        />
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{format(selectedDate, 'MMM d, yyyy')}:</span>
            <span className={cn('font-medium', blocked ? 'text-red-600' : 'text-green-600')}>
              {blocked ? 'Unavailable' : 'Available'}
            </span>
          </div>
          {blocked && blockedReason && <p className="mt-1 text-muted-foreground">Reason: {blockedReason}</p>}
        </div>
      )}
    </div>
  )
}
