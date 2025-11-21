'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { BlockedDate, BlockedDateInsert } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, parseISO, isWithinInterval, startOfDay } from 'date-fns'
import type { DayButton } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Trash2, Plus } from 'lucide-react'

export default function CalendarPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [newBlockedDate, setNewBlockedDate] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  })
  const [saving, setSaving] = useState(false)

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

  const isDateBlocked = (date: Date): boolean => {
    const dateStart = startOfDay(date)
    return blockedDates.some(blocked => {
      const startDate = startOfDay(parseISO(blocked.start_date))
      const endDate = startOfDay(parseISO(blocked.end_date))
      return isWithinInterval(dateStart, { start: startDate, end: endDate })
    })
  }

  const getBlockedReasonForDate = (date: Date): string | null => {
    const dateStart = startOfDay(date)
    const blocked = blockedDates.find(b => {
      const startDate = startOfDay(parseISO(b.start_date))
      const endDate = startOfDay(parseISO(b.end_date))
      return isWithinInterval(dateStart, { start: startDate, end: endDate })
    })
    return blocked?.reason || null
  }

  const addBlockedDate = async () => {
    if (!newBlockedDate.start_date || !newBlockedDate.end_date) {
      alert('Please select both start and end dates')
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()

      const insertData: BlockedDateInsert = {
        start_date: newBlockedDate.start_date,
        end_date: newBlockedDate.end_date,
        reason: newBlockedDate.reason || null,
        created_by: userData.user?.email || null
      }

      const { error } = await supabase.from('blocked_dates').insert(insertData)

      if (error) throw error

      // Reset form
      setNewBlockedDate({ start_date: '', end_date: '', reason: '' })
      // Refresh list
      await fetchBlockedDates()
    } catch (error) {
      console.error('Error adding blocked date:', error)
      alert('Failed to add blocked date')
    } finally {
      setSaving(false)
    }
  }

  const deleteBlockedDate = async (id: string) => {
    if (!confirm('Are you sure you want to remove this blocked date range?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id)

      if (error) throw error

      await fetchBlockedDates()
    } catch (error) {
      console.error('Error deleting blocked date:', error)
      alert('Failed to delete blocked date')
    }
  }

  // Custom day button that shows blocked dates in red, available dates in green, and past dates greyed out
  const CustomDayButton = (props: React.ComponentProps<typeof DayButton>) => {
    const blocked = isDateBlocked(props.day.date)
    const isPast = startOfDay(props.day.date) < startOfDay(new Date())

    return (
      <div className="p-0.5">
        <CalendarDayButton
          {...props}
          className={cn(
            props.className,
            isPast
              ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 opacity-50'
              : blocked
                ? 'bg-red-100 text-red-900 hover:bg-red-200 data-[selected-single=true]:bg-red-500 data-[selected-single=true]:text-white'
                : 'bg-green-100 text-green-900 hover:bg-green-200 data-[selected-single=true]:bg-green-500 data-[selected-single=true]:text-white'
          )}
        />
      </div>
    )
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

  const blocked = selectedDate ? isDateBlocked(selectedDate) : false
  const blockedReason = selectedDate ? getBlockedReasonForDate(selectedDate) : null

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        {/* Calendar and Management Side by Side */}
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          {/* Left: Calendar */}
          <div>
            {/* Legend */}
            <div className="mb-4 flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">Blocked</span>
              </div>
            </div>

            <div style={{ '--cell-size': '2.5rem' } as React.CSSProperties}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                components={{
                  DayButton: CustomDayButton
                }}
                className="rounded-md border shadow-sm"
              />
            </div>

            {/* Discreet Selected Date Info */}
            {selectedDate && (
              <div className="mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{format(selectedDate, 'MMM d, yyyy')}:</span>
                  <span className={cn('font-medium', blocked ? 'text-red-600' : 'text-green-600')}>
                    {blocked ? 'Blocked' : 'Available'}
                  </span>
                </div>
                {blocked && blockedReason && (
                  <p className="mt-1 text-muted-foreground">Reason: {blockedReason}</p>
                )}
              </div>
            )}
          </div>

          {/* Right: Management */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Blocked Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Blocked Date Form */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 font-semibold">Add Blocked Date Range</h3>
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
                <Button
                  onClick={addBlockedDate}
                  disabled={saving}
                  className="mt-4 w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {saving ? 'Adding...' : 'Add Blocked Date'}
                </Button>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBlockedDate(blocked.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
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
