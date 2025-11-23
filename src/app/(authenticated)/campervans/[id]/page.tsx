'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { Van, Booking } from '@/lib/supabase'
import { formatDate, calculateDays } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Trash2, Edit } from 'lucide-react'
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

export default function CampervanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vanId = params.id as string

  const [van, setVan] = useState<Van | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (vanId) {
      fetchVan()
      fetchBookings()
    }
  }, [vanId])

  const fetchVan = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vans')
        .select('*')
        .eq('id', vanId)
        .single()

      if (error) throw error
      setVan(data)
    } catch (error) {
      console.error('Error fetching campervan:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    setBookingsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('van_id', vanId)
        .order('departure_date', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vans')
        .delete()
        .eq('id', vanId)

      if (error) throw error

      router.push('/campervans')
    } catch (error) {
      console.error('Error deleting campervan:', error)
      alert('Failed to delete campervan. Please try again.')
      setIsDeleting(false)
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

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="p-8 text-center text-gray-600">Loading campervan details...</div>
        </div>
      </div>
    )
  }

  if (!van) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="p-8 text-center text-gray-600">Campervan not found.</div>
          <div className="text-center">
            <Button size="sm" onClick={() => router.push('/campervans')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Campervans
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
            size="sm"
            variant="ghost"
            onClick={() => router.push('/campervans')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campervans
          </Button>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => router.push(`/campervans/${vanId}/edit`)}
            >
              <Edit className="h-4 w-4" />
              Edit Van
            </Button>

            {process.env.NODE_ENV !== 'production' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                    Delete Van
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the campervan
                      <strong> {van.name}</strong> from the system.
                      {bookings.length > 0 && (
                        <span className="block mt-2 text-red-600 font-medium">
                          Warning: This van has {bookings.length} existing {bookings.length === 1 ? 'booking' : 'bookings'}.
                          Deleting it may affect booking records.
                        </span>
                      )}
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
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{van.name}</h1>
            <Badge className={
              van.is_active
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
            }>
              {van.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </div>
          <p className="text-gray-600">
            Added on {formatDate(van.created_at, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          {/* Campervan Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campervan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Van Name</p>
                  <p className="text-gray-900">{van.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                  <Badge className={
                    van.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                  }>
                    {van.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>

                {van.purchased_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Purchase Date</p>
                    <p className="text-gray-900">
                      {formatDate(van.purchased_at, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Created</p>
                  <p className="text-gray-900">
                    {formatDate(van.created_at, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {van.description || <span className="text-gray-400 italic">No description added yet</span>}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bookings History */}
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} for this campervan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {bookingsLoading ? (
                <div className="p-8 text-center text-gray-600">
                  Loading bookings...
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No bookings found for this campervan.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Return</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                      >
                        <TableCell className="font-medium">
                          {booking.first_name} {booking.last_name}
                        </TableCell>
                        <TableCell>{formatDate(booking.departure_date)}</TableCell>
                        <TableCell>{formatDate(booking.return_date)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.toUpperCase()}
                          </Badge>
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
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
