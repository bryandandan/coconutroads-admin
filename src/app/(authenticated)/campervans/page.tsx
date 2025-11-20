'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { Van } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Eye, Trash2 } from 'lucide-react'
import { AddVanModal } from '@/components/add-van-modal'

export default function CampervansPage() {
  const router = useRouter()
  const [vans, setVans] = useState<Van[]>([])
  const [loading, setLoading] = useState(true)
  const isDev = process.env.NODE_ENV !== 'production'

  const fetchVans = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVans(data || [])
    } catch (error) {
      console.error('Error fetching campervans:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVans()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDelete = async (vanId: string, vanName: string) => {
    if (!confirm(`Are you sure you want to delete ${vanName}? This action cannot be undone.`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('vans')
        .delete()
        .eq('id', vanId)

      if (error) throw error

      // Refresh the list
      fetchVans()
    } catch (error) {
      console.error('Error deleting van:', error)
      alert('Failed to delete van. Please try again.')
    }
  }

  const activeVans = vans.filter(v => v.is_active)
  const inactiveVans = vans.filter(v => !v.is_active)

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
        <div className="mb-6 flex items-start justify-between">
          <div className="text-sm text-muted-foreground">
            {activeVans.length} active, {inactiveVans.length} inactive
          </div>
          <AddVanModal onVanAdded={fetchVans} />
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-600">
                Loading campervans...
              </div>
            ) : vans.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No campervans found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchased</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vans.map((van) => (
                    <TableRow
                      key={van.id}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {van.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {van.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          van.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }>
                          {van.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {van.purchased_at ? formatDate(van.purchased_at) : '-'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(van.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/campervans/${van.id}`)
                                }}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View</p>
                            </TooltipContent>
                          </Tooltip>
                          {isDev && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(van.id, van.name)
                                  }}
                                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
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
    </TooltipProvider>
  )
}
