'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Booking, Van } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { AddBookingModal } from '@/components/add-booking-modal'

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' }
]

export default function BookingsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [vans, setVans] = useState<Van[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
    fetchVans()
  }, [])

  // Set up real-time subscription for automatic updates
  useEffect(() => {
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          // Refetch bookings when any change occurs
          fetchBookings()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, vans(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVans = async () => {
    try {
      const { data, error } = await supabase
        .from('vans')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setVans(data || [])
    } catch (error) {
      console.error('Error fetching vans:', error)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              Loading bookings...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={bookings}
              searchColumn="email"
              searchPlaceholder="Filter by email..."
              filterColumns={[
                {
                  column: 'status',
                  title: 'Status',
                  options: statusOptions
                }
              ]}
              actionButton={<AddBookingModal onBookingAdded={fetchBookings} />}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
