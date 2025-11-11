'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, type Booking } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Mail, Phone, Globe, User, Clock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (error) throw error
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (
    newStatus: 'approved' | 'rejected',
    adminNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          approved_by: 'Admin',
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', bookingId)

      if (error) throw error

      // Refresh booking
      fetchBooking()
      setIsDialogOpen(false)
      setRejectNotes('')
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking status')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 text-center text-gray-600">Loading booking details...</div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
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
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/bookings')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-gray-600">
            Submitted on {formatDate(booking.created_at)}
          </p>
        </div>

        <div className="space-y-6">
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
                  <p className="text-base text-gray-900">{booking.surname_and_name}</p>
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

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Nationality</p>
                  <p className="text-base text-gray-900">{booking.nationality}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Birth Date</p>
                  <p className="text-base text-gray-900">{formatDate(booking.birth_date)}</p>
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
                  <p className="text-base text-gray-900">{formatDate(booking.departure_date)}</p>
                  <p className="text-sm text-gray-500">Pick-up between 15:00 – 18:00 hrs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Return Date</p>
                  <p className="text-base text-gray-900">{formatDate(booking.return_date)}</p>
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
                    Updated by {booking.approved_by} on {formatDate(booking.approved_at)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">{booking.admin_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {booking.status === 'pending' && (
            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Review and approve or reject this booking request
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button
                  onClick={() => updateBookingStatus('approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Booking
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking for {booking.surname_and_name}?
              You can optionally provide a reason below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Reason for rejection (optional)
            </label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter reason for rejection..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => updateBookingStatus('rejected', rejectNotes || undefined)}
              className="bg-pink-500 hover:bg-pink-600"
            >
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
