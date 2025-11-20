'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Van } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface AddBookingModalProps {
  onBookingAdded?: () => void
}

export function AddBookingModal({ onBookingAdded }: AddBookingModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vans, setVans] = useState<Van[]>([])
  const [formData, setFormData] = useState({
    surname_and_name: '',
    email: '',
    birth_date: '',
    telephone: '',
    departure_date: '',
    return_date: '',
    van_id: '',
    requests: '',
    admin_notes: ''
  })

  useEffect(() => {
    if (open) {
      fetchVans()
    }
  }, [open])

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
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('bookings').insert([
        {
          surname_and_name: formData.surname_and_name,
          email: formData.email,
          birth_date: formData.birth_date,
          telephone: formData.telephone,
          departure_date: formData.departure_date,
          return_date: formData.return_date,
          van_id: formData.van_id || null,
          requests: formData.requests || null,
          admin_notes: formData.admin_notes || null,
          terms_accepted: true,
          status: 'pending'
        }
      ])

      if (error) throw error

      // Reset form and close modal
      setFormData({
        surname_and_name: '',
        email: '',
        birth_date: '',
        telephone: '',
        departure_date: '',
        return_date: '',
        van_id: '',
        requests: '',
        admin_notes: ''
      })
      setOpen(false)

      // Notify parent to refresh the list
      onBookingAdded?.()
    } catch (error) {
      console.error('Error adding booking:', error)
      alert('Failed to add booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
            <DialogDescription>Create a new booking for testing purposes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="surname_and_name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="surname_and_name"
                  value={formData.surname_and_name}
                  onChange={(e) => setFormData({ ...formData, surname_and_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="birth_date">
                  Birth Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telephone">
                  Telephone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="+66 123 456 789"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departure_date">
                  Departure Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="return_date">
                  Return Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="return_date"
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                  min={formData.departure_date}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="van_id">Campervan</Label>
              <Select value={formData.van_id} onValueChange={(value) => setFormData({ ...formData, van_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a van (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {vans.map((van) => (
                    <SelectItem key={van.id} value={van.id}>
                      {van.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requests">Customer Requests</Label>
              <Textarea
                id="requests"
                value={formData.requests}
                onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                rows={2}
                placeholder="Any special requests from the customer..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                rows={2}
                placeholder="Internal notes for admins..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
