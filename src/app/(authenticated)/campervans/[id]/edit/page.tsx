'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { Van } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditCampervanPage() {
  const router = useRouter()
  const params = useParams()
  const vanId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    purchased_at: ''
  })

  useEffect(() => {
    if (vanId) {
      fetchVan()
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

      setFormData({
        name: data.name || '',
        description: data.description || '',
        is_active: data.is_active ?? true,
        purchased_at: data.purchased_at ? data.purchased_at.split('T')[0] : ''
      })
    } catch (error) {
      console.error('Error fetching campervan:', error)
      alert('Failed to load campervan details.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      const updateData: {
        name: string
        description: string | null
        is_active: boolean
        purchased_at: string | null
      } = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
        purchased_at: formData.purchased_at || null
      }

      const { error } = await supabase
        .from('vans')
        .update(updateData)
        .eq('id', vanId)

      if (error) throw error

      router.push(`/campervans/${vanId}`)
    } catch (error) {
      console.error('Error updating campervan:', error)
      alert('Failed to update campervan. Please try again.')
      setSaving(false)
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push('/campervans')}
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campervans
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Campervan</h1>
          <p className="text-gray-600 mt-1">Update campervan details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Campervan Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Van Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter van name"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchased_at">Purchase Date</Label>
                <Input
                  id="purchased_at"
                  type="date"
                  value={formData.purchased_at}
                  onChange={(e) => setFormData({ ...formData, purchased_at: e.target.value })}
                  disabled={saving}
                />
                <p className="text-sm text-gray-500">Optional: When was this van purchased?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter van description, features, or notes..."
                  className="min-h-[120px] resize-none"
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between pt-2 pb-2 border-t">
                <div>
                  <Label htmlFor="is_active" className="text-base">Van Status</Label>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {formData.is_active ? 'Available for bookings' : 'Not available for bookings'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${formData.is_active ? 'text-green-700' : 'text-gray-600'}`}>
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/campervans')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
