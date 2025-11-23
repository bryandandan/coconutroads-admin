'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'

interface AddVanModalProps {
  onVanAdded?: () => void
}

export function AddVanModal({ onVanAdded }: AddVanModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchased_at: '',
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('vans').insert([
        {
          name: formData.name,
          description: formData.description || null,
          purchased_at: formData.purchased_at || null,
          is_active: formData.is_active
        }
      ])

      if (error) throw error

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        purchased_at: '',
        is_active: true
      })
      setOpen(false)

      // Notify parent to refresh the list
      onVanAdded?.()
    } catch (error) {
      console.error('Error adding van:', error)
      alert('Failed to add van. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add Van
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Campervan</DialogTitle>
            <DialogDescription>Add a new campervan to your fleet.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="purchased_at">Purchase Date</Label>
              <Input
                id="purchased_at"
                type="date"
                value={formData.purchased_at}
                onChange={(e) => setFormData({ ...formData, purchased_at: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked === true })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active (available for booking)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Van'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
