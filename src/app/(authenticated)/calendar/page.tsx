'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Booking, Van } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { format, parseISO, isWithinInterval, isSameDay } from 'date-fns'
import type { DayButton } from 'react-day-picker'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [vans, setVans] = useState<Van[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['pending', 'approved'])
        .order('departure_date', { ascending: true })

      if (bookingsError) throw bookingsError

      // Fetch vans
      const { data: vansData, error: vansError } = await supabase
        .from('vans')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (vansError) throw vansError

      setBookings(bookingsData || [])
      setVans(vansData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVanColor = (vanId: string): string => {
    const colors = [
      'bg-blue-500 hover:bg-blue-600 text-white',
      'bg-green-500 hover:bg-green-600 text-white',
      'bg-purple-500 hover:bg-purple-600 text-white',
      'bg-orange-500 hover:bg-orange-600 text-white',
      'bg-pink-500 hover:bg-pink-600 text-white',
      'bg-cyan-500 hover:bg-cyan-600 text-white'
    ]
    const index = vans.findIndex(v => v.id === vanId)
    return colors[index % colors.length]
  }

  const getVanDotColor = (vanId: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500'
    ]
    const index = vans.findIndex(v => v.id === vanId)
    return colors[index % colors.length]
  }

  const getVanColorBorder = (vanId: string): string => {
    const colors = [
      'bg-blue-50 border-l-blue-500',
      'bg-green-50 border-l-green-500',
      'bg-purple-50 border-l-purple-500',
      'bg-orange-50 border-l-orange-500',
      'bg-pink-50 border-l-pink-500',
      'bg-cyan-50 border-l-cyan-500'
    ]
    const index = vans.findIndex(v => v.id === vanId)
    return colors[index % colors.length]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const departureDate = parseISO(booking.departure_date)
      const returnDate = parseISO(booking.return_date)

      return isWithinInterval(date, {
        start: departureDate,
        end: returnDate
      })
    })
  }

  const getVansForDate = (date: Date): string[] => {
    const bookingsForDate = getBookingsForDate(date)
    const vanIds = bookingsForDate
      .map(b => b.van_id)
      .filter((id): id is string => id !== null)
    // Return unique van IDs
    return [...new Set(vanIds)]
  }

  const getVanName = (vanId: string | null) => {
    if (!vanId) return 'Unassigned'
    const van = vans.find(v => v.id === vanId)
    return van?.name || 'Unknown'
  }

  const bookingsOnSelectedDate = selectedDate ? getBookingsForDate(selectedDate) : []

  // Custom day button that shows multiple colored dots
  const CustomDayButton = (props: React.ComponentProps<typeof DayButton>) => {
    const vansForDay = getVansForDate(props.day.date)

    return (
      <div className="relative w-full h-full">
        <CalendarDayButton {...props} />
        {vansForDay.length > 0 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {vansForDay.map(vanId => (
              <div
                key={vanId}
                className={cn('h-1 w-1 rounded-full', getVanDotColor(vanId))}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        {/* Calendar and Bookings Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          <div>
            {/* Van Color Legend - Compact and above calendar */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {vans.map(van => (
                <div key={van.id} className={`px-3 py-1 rounded-full text-xs font-medium ${getVanColor(van.id)}`}>
                  {van.name}
                </div>
              ))}
            </div>

            <div style={{ '--cell-size': '2.5rem' } as React.CSSProperties}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                components={{
                  DayButton: CustomDayButton
                }}
                className="rounded-md border shadow-sm"
              />
            </div>
          </div>

          <Card className="lg:max-h-[600px] lg:overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsOnSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings on this date</p>
              ) : (
                <div className="space-y-4">
                  {bookingsOnSelectedDate.map(booking => {
                    const departureDate = parseISO(booking.departure_date)
                    const returnDate = parseISO(booking.return_date)
                    const isDeparture = selectedDate && isSameDay(selectedDate, departureDate)
                    const isReturn = selectedDate && isSameDay(selectedDate, returnDate)

                    return (
                      <div
                        key={booking.id}
                        className={`rounded-lg p-4 border-l-4 ${booking.van_id ? getVanColorBorder(booking.van_id) : 'bg-gray-50 border-l-gray-300'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{booking.first_name} {booking.last_name}</p>
                            <p className="text-sm opacity-75">{getVanName(booking.van_id)}</p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Rental:</span>{' '}
                            {format(departureDate, 'MMM d')} - {format(returnDate, 'MMM d, yyyy')}
                          </p>
                          {isDeparture && (
                            <p className="font-medium text-green-700">🚀 Departure</p>
                          )}
                          {isReturn && (
                            <p className="font-medium text-blue-700">🏁 Return</p>
                          )}
                          <p>
                            <span className="font-medium">Email:</span>{' '}
                            <a href={`mailto:${booking.email}`} className="underline">
                              {booking.email}
                            </a>
                          </p>
                          {booking.telephone && (
                            <p>
                              <span className="font-medium">Phone:</span> {booking.telephone}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
