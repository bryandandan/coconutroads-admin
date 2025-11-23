'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { BlockedDate, BlockedDateInsert } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { format, parseISO, differenceInDays } from 'date-fns'
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
  const [dialogOpen, setDialogOpen] = useState(false)

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
      setDialogOpen(false)
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
    setDialogOpen(true)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setNewBlockedDate({ start_date: '', end_date: '', reason: '' })
    setDialogOpen(false)
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
        <div className="space-y-6">
          {/* Calendar */}
          <div key={refreshKey} className="flex justify-center">
            <AvailabilityCalendar />
          </div>

          {/* Manage Blocked Dates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Blocked Dates</CardTitle>
                <CardDescription>
                  {blockedDates.length} {blockedDates.length === 1 ? 'date range' : 'date ranges'} blocked
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Add Blocked Date
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Blocked Date Range' : 'Add Blocked Date Range'}</DialogTitle>
                    <DialogDescription>
                      {editingId
                        ? 'Update the blocked date range details below.'
                        : 'Block a date range to prevent bookings during maintenance or holidays.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
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
                    <div className="flex gap-2 pt-2">
                      <Button onClick={addBlockedDate} disabled={saving} className="flex-1">
                        {saving ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update' : 'Add')}
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {blockedDates.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No blocked dates. All dates are available for booking.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedDates.map(blocked => {
                      const days = differenceInDays(parseISO(blocked.end_date), parseISO(blocked.start_date)) + 1
                      return (
                        <TableRow key={blocked.id}>
                          <TableCell className="font-medium">
                            {format(parseISO(blocked.start_date), 'MMM d, yyyy')} -{' '}
                            {format(parseISO(blocked.end_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>{days}</TableCell>
                          <TableCell>{blocked.reason || <span className="text-gray-400 italic">No reason</span>}</TableCell>
                          <TableCell>{blocked.created_by || <span className="text-gray-400 italic">Unknown</span>}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => startEditing(blocked)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteBlockedDate(blocked.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
