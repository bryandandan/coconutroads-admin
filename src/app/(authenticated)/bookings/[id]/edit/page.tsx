'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { Booking, Van } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditBookingPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [vans, setVans] = useState<Van[]>([])
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    birth_date: '',
    departure_date: '',
    return_date: '',
    van_id: '',
    requests: '',
    admin_notes: ''
  })

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
      fetchVans()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (error) throw error

      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        telephone: data.telephone || '',
        birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
        departure_date: data.departure_date ? data.departure_date.split('T')[0] : '',
        return_date: data.return_date ? data.return_date.split('T')[0] : '',
        van_id: data.van_id || '',
        requests: data.requests || '',
        admin_notes: data.admin_notes || ''
      })
    } catch (error) {
      console.error('Error fetching booking:', error)
      alert('Failed to load booking details.')
    } finally {
      setLoading(false)
    }
  }

  const fetchVans = async () => {
    try {
      const supabase = createClient()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      const updateData: {
        first_name: string
        last_name: string
        email: string
        telephone: string
        birth_date: string
        departure_date: string
        return_date: string
        van_id: string | null
        requests: string | null
        admin_notes: string | null
      } = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        birth_date: formData.birth_date,
        departure_date: formData.departure_date,
        return_date: formData.return_date,
        van_id: formData.van_id || null,
        requests: formData.requests.trim() || null,
        admin_notes: formData.admin_notes.trim() || null
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)

      if (error) throw error

      router.push(`/bookings/${bookingId}`)
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking. Please try again.')
      setSaving(false)
    }
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/bookings')}
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
          <p className="text-gray-600 mt-1">Update booking details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Van Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Van Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="van_id">Assigned Van</Label>
                  <Select
                    value={formData.van_id || 'unassigned'}
                    onValueChange={(value) => setFormData({ ...formData, van_id: value === 'unassigned' ? '' : value })}
                    disabled={saving}
                  >
                    <SelectTrigger id="van_id">
                      <SelectValue placeholder="Select a van..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No van assigned</SelectItem>
                      {vans.map((van) => (
                        <SelectItem key={van.id} value={van.id}>
                          {van.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">
                    Birth Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    required
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="departure_date">
                    Departure Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="departure_date"
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                    required
                    disabled={saving}
                  />
                  <p className="text-sm text-gray-500">Pick-up between 15:00 – 18:00 hrs</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return_date">
                    Return Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="return_date"
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                    required
                    disabled={saving}
                  />
                  <p className="text-sm text-gray-500">Drop-off between 09:00 – 12:00 hrs</p>
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Special Requests & Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="requests">Customer Requests</Label>
                  <Textarea
                    id="requests"
                    value={formData.requests}
                    onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                    placeholder="Any special requests or comments from the customer..."
                    className="min-h-[120px] resize-none"
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card className="border-pink-200 bg-pink-50">
              <CardHeader>
                <CardTitle className="text-pink-900">Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Internal Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    placeholder="Internal notes for admins (not visible to customers)..."
                    className="min-h-[120px] resize-none"
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/bookings')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
