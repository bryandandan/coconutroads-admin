'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { Booking, Van, BookingStatusHistory, BookingStatus } from '@/lib/supabase'
import { Constants } from '@/lib/database.types'
import { formatDate, calculateDays } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Calendar, Mail, Phone, User, Clock, ArrowLeft, Trash2, Car } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  const supabase = createClient()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [vans, setVans] = useState<Van[]>([])
  const [statusHistory, setStatusHistory] = useState<BookingStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null)
  const [statusNotes, setStatusNotes] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
      fetchVans()
      fetchStatusHistory()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('bookings').select('*').eq('id', bookingId).single()

      if (error) throw error
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
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

  const fetchStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_status_history')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStatusHistory(data || [])
    } catch (error) {
      console.error('Error fetching status history:', error)
    }
  }

  const updateBookingStatus = async (newStatus: BookingStatus, adminNotes?: string) => {
    if (!booking) return

    try {
      const oldStatus = booking.status
      const changedBy = 'contact@coconutroads.com'
      const changedAt = new Date().toISOString()

      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          approved_by: changedBy,
          approved_at: changedAt,
          admin_notes: adminNotes || null
        })
        .eq('id', bookingId)

      if (bookingError) throw bookingError

      // Create status history record
      const { error: historyError } = await supabase.from('booking_status_history').insert({
        booking_id: bookingId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
        notes: adminNotes || null
      })

      if (historyError) throw historyError

      // Refresh booking and history
      fetchBooking()
      fetchStatusHistory()
      setIsDialogOpen(false)
      setSelectedStatus(null)
      setStatusNotes('')
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking status')
    }
  }

  const updateVanAssignment = async (vanId: string | null) => {
    if (!booking) return

    // Optimistically update local state
    const previousVanId = booking.van_id
    const updatedAt = new Date().toISOString()

    setBooking({
      ...booking,
      van_id: vanId,
      updated_at: updatedAt
    })

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          van_id: vanId,
          updated_at: updatedAt
        })
        .eq('id', bookingId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating van assignment:', error)
      alert('Failed to update van assignment')

      // Revert on error
      setBooking({
        ...booking,
        van_id: previousVanId
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId)

      if (error) throw error

      router.push('/bookings')
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking. Please try again.')
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: BookingStatus) => {
    const colors: Record<BookingStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      approved: 'bg-green-100 text-green-800 hover:bg-green-100',
      rejected: 'bg-pink-100 text-pink-800 hover:bg-pink-100',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
      completed: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    }
    return colors[status]
  }


  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="p-8 text-center text-gray-600">Loading booking details...</div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="p-8 text-center text-gray-600">Booking not found.</div>
          <div className="text-center">
            <Button onClick={() => router.push('/bookings')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/bookings')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>

          {process.env.NODE_ENV !== 'production' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Booking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the booking for
                    <strong> {booking.first_name} {booking.last_name}</strong> from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <Badge className={getStatusColor(booking.status)}>{booking.status.toUpperCase()}</Badge>
          </div>
          <p className="text-gray-600">Submitted on {formatDate(booking.created_at, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-6">
          {/* Van Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Van Assignment</CardTitle>
              <CardDescription>Assign a campervan to this booking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">Assigned Van</p>
                  <Select
                    value={booking.van_id || 'unassigned'}
                    onValueChange={value => updateVanAssignment(value === 'unassigned' ? null : value)}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select a van..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No van assigned</SelectItem>
                      {vans.map(van => (
                        <SelectItem
                          key={van.id}
                          value={van.id}
                        >
                          {van.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Full Name</p>
                  <p className="text-base text-gray-900">{booking.first_name} {booking.last_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <a
                    href={`mailto:${booking.email}`}
                    className="text-base text-blue-600 hover:underline"
                  >
                    {booking.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone Number</p>
                  <a
                    href={`tel:${booking.telephone}`}
                    className="text-base text-blue-600 hover:underline"
                  >
                    {booking.telephone}
                  </a>
                </div>
              </div>

              {/* <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Nationality</p>
                  <p className="text-base text-gray-900">{booking.nationality}</p>
                </div>
              </div> */}

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Birth Date</p>
                  <p className="text-base text-gray-900">{formatDate(booking.birth_date, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Departure Date</p>
                  <p className="text-base text-gray-900">{formatDate(booking.departure_date, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm text-gray-500">Pick-up between 15:00 – 18:00 hrs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Return Date</p>
                  <p className="text-base text-gray-900">{formatDate(booking.return_date, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm text-gray-500">Drop-off between 09:00 – 12:00 hrs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Trip Duration</p>
                  <p className="text-base text-gray-900">
                    {calculateDays(booking.departure_date, booking.return_date)} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          {booking.requests && (
            <Card>
              <CardHeader>
                <CardTitle>Special Requests & Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">{booking.requests}</p>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          {booking.admin_notes && (
            <Card className="border-pink-200 bg-pink-50">
              <CardHeader>
                <CardTitle className="text-pink-900">Admin Notes</CardTitle>
                {booking.approved_at && (
                  <CardDescription>
                    Updated by {booking.approved_by} on {formatDate(booking.approved_at, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">{booking.admin_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          {statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
                <CardDescription>Timeline of status changes for this booking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            history.new_status === 'approved'
                              ? 'bg-green-500'
                              : history.new_status === 'rejected'
                              ? 'bg-pink-500'
                              : history.new_status === 'completed'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        {index < statusHistory.length - 1 && (
                          <div className="w-0.5 h-full min-h-[40px] bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pt-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(history.new_status)}>
                            {history.new_status.toUpperCase()}
                          </Badge>
                          {history.old_status && (
                            <span className="text-sm text-gray-500">
                              from <span className="font-medium">{history.old_status}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {formatDate(history.created_at, { year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
                          {history.created_at ? new Date(history.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </p>
                        {history.changed_by && <p className="text-sm text-gray-500 mb-2">by {history.changed_by}</p>}
                        {history.notes && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Management */}
          <Card className="border-gray-300">
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
              <CardDescription>Change the booking status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">Change Status To</p>
                  <Select
                    value=""
                    onValueChange={(value: BookingStatus) => {
                      setSelectedStatus(value)
                      setIsDialogOpen(true)
                    }}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select new status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.booking_status
                        .filter(status => status !== booking.status)
                        .map(status => (
                          <SelectItem
                            key={status}
                            value={status}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={open => {
          setIsDialogOpen(open)
          if (!open) {
            setSelectedStatus(null)
            setStatusNotes('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Booking Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change this booking status to <strong>{selectedStatus}</strong> for {booking?.first_name} {booking?.last_name}? You can optionally provide notes below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Notes (optional)</label>
            <textarea
              value={statusNotes}
              onChange={e => setStatusNotes(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any notes or reasons for this status change..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setSelectedStatus(null)
                setStatusNotes('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedStatus) {
                  updateBookingStatus(selectedStatus, statusNotes || undefined)
                }
              }}
              className={(() => {
                const buttonColors: Record<BookingStatus, string> = {
                  pending: 'bg-yellow-600 hover:bg-yellow-700',
                  approved: 'bg-green-600 hover:bg-green-700',
                  rejected: 'bg-pink-500 hover:bg-pink-600',
                  cancelled: 'bg-red-600 hover:bg-red-700',
                  completed: 'bg-blue-600 hover:bg-blue-700'
                }
                return selectedStatus ? buttonColors[selectedStatus] : 'bg-gray-600 hover:bg-gray-700'
              })()}
            >
              Change Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
