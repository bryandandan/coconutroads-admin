'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { Van } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { AddVanModal } from '@/components/add-van-modal'

export default function CampervansPage() {
  const router = useRouter()
  const [vans, setVans] = useState<Van[]>([])
  const [loading, setLoading] = useState(true)

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

  const activeVans = vans.filter(v => v.is_active)
  const inactiveVans = vans.filter(v => !v.is_active)

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Campervan Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage your fleet of campervans ({activeVans.length} active, {inactiveVans.length} inactive)
            </p>
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
                        {formatDate(van.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/campervans/${van.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
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
  )
}
