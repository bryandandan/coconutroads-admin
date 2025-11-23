'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { BlockedDate, BlockedDateInsert } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, parseISO } from 'date-fns'
import { Trash2, Plus, Pencil } from 'lucide-react'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'

export default function CalendarPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [newBlockedDate, setNewBlockedDate] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  })
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBlockedDates()
  }, [])

  const fetchBlockedDates = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) throw error

      setBlockedDates(data || [])
    } catch (error) {
      console.error('Error fetching blocked dates:', error)
    } finally {
      setLoading(false)
    }
  }

  const addBlockedDate = async () => {
    if (!newBlockedDate.start_date || !newBlockedDate.end_date) {
      alert('Please select both start and end dates')
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()

      if (editingId) {
        // Update existing blocked date
        const { error } = await supabase
          .from('blocked_dates')
          .update({
            start_date: newBlockedDate.start_date,
            end_date: newBlockedDate.end_date,
            reason: newBlockedDate.reason || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Insert new blocked date
        const { data: userData } = await supabase.auth.getUser()

        const insertData: BlockedDateInsert = {
          start_date: newBlockedDate.start_date,
          end_date: newBlockedDate.end_date,
          reason: newBlockedDate.reason || null,
          created_by: userData.user?.email || null
        }

        const { error } = await supabase.from('blocked_dates').insert(insertData)

        if (error) throw error
      }

      // Reset form
      setNewBlockedDate({ start_date: '', end_date: '', reason: '' })
      setEditingId(null)
      // Refresh list and calendar
      await fetchBlockedDates()
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error saving blocked date:', error)
      alert('Failed to save blocked date')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (blocked: BlockedDate) => {
    setEditingId(blocked.id)
    setNewBlockedDate({
      start_date: blocked.start_date,
      end_date: blocked.end_date,
      reason: blocked.reason || ''
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setNewBlockedDate({ start_date: '', end_date: '', reason: '' })
  }

  const deleteBlockedDate = async (id: string) => {
    if (!confirm('Are you sure you want to remove this blocked date range?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id)

      if (error) throw error

      // Refresh list and calendar
      await fetchBlockedDates()
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error deleting blocked date:', error)
      alert('Failed to delete blocked date')
    }
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
        {/* Calendar and Management Side by Side */}
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          {/* Left: Standalone Calendar */}
          <div key={refreshKey}>
            <AvailabilityCalendar />
          </div>

          {/* Right: Management */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Blocked Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add/Edit Blocked Date Form */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 font-semibold">
                  {editingId ? 'Edit Blocked Date Range' : 'Add Blocked Date Range'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newBlockedDate.start_date}
                      onChange={e => setNewBlockedDate({ ...newBlockedDate, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newBlockedDate.end_date}
                      onChange={e => setNewBlockedDate({ ...newBlockedDate, end_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Input
                      id="reason"
                      type="text"
                      placeholder="e.g., Maintenance, Holiday"
                      value={newBlockedDate.reason}
                      onChange={e => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={addBlockedDate} disabled={saving} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    {saving ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update' : 'Add Blocked Date')}
                  </Button>
                  {editingId && (
                    <Button onClick={cancelEditing} variant="outline" disabled={saving}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Blocked Dates List */}
              <div>
                <h3 className="mb-4 font-semibold">Current Blocked Dates</h3>
                {blockedDates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No blocked dates. All dates are available.</p>
                ) : (
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {blockedDates.map(blocked => (
                      <div
                        key={blocked.id}
                        className="flex items-center justify-between rounded-lg border bg-red-50 p-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {format(parseISO(blocked.start_date), 'MMM d, yyyy')} -{' '}
                            {format(parseISO(blocked.end_date), 'MMM d, yyyy')}
                          </div>
                          {blocked.reason && <div className="text-sm text-muted-foreground">{blocked.reason}</div>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(blocked)}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteBlockedDate(blocked.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
