'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Booking } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye } from 'lucide-react'

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchBookings()
  }, [filter])

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
  }, [filter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'rejected':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const filteredBookings = bookings.filter(booking =>
    filter === 'all' || booking.status === filter
  )

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const approvedCount = bookings.filter(b => b.status === 'approved').length
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDays = (departure: string, returnDate: string) => {
    const start = new Date(departure)
    const end = new Date(returnDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
        <p className="text-gray-600">Manage motorhome rental bookings</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="all">
            All ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-600">
                  Loading bookings...
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No bookings found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Return</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                      >
                        <TableCell className="font-medium">
                          {booking.surname_and_name}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${booking.email}`}
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {booking.email}
                          </a>
                        </TableCell>
                        <TableCell>{formatDate(booking.departure_date)}</TableCell>
                        <TableCell>{formatDate(booking.return_date)}</TableCell>
                        <TableCell>
                          {calculateDays(booking.departure_date, booking.return_date)} days
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(booking.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/bookings/${booking.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
