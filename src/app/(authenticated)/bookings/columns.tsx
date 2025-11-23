'use client'

import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import type { Booking } from '@/lib/supabase'
import { formatDate, calculateDays } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { createClient } from '@/lib/supabase-client'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 'rejected':
      return 'bg-pink-100 text-pink-800 hover:bg-pink-100'
    case 'completed':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
}

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'first_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const fullName = `${row.original.first_name} ${row.original.last_name}`.toLowerCase()
      return fullName.includes(value.toLowerCase())
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <a
          href={`mailto:${row.getValue('email')}`}
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.getValue('email')}
        </a>
      )
    }
  },
  {
    id: 'van_name',
    accessorFn: (row: any) => row.vans?.name || null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Van" />
    ),
    cell: ({ row }) => {
      const vanName = row.getValue('van_name') as string | null
      return <div className="text-gray-600">{vanName || '-'}</div>
    }
  },
  {
    accessorKey: 'departure_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Departure" />
    ),
    cell: ({ row }) => formatDate(row.getValue('departure_date'))
  },
  {
    accessorKey: 'return_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Return" />
    ),
    cell: ({ row }) => formatDate(row.getValue('return_date'))
  },
  {
    id: 'duration',
    accessorFn: (row) => calculateDays(row.departure_date, row.return_date),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const days = row.getValue('duration') as number
      return `${days} days`
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge className={getStatusColor(status)}>
          {status.toUpperCase()}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted" />
    ),
    cell: ({ row }) => (
      <div className="text-gray-600">{formatDate(row.getValue('created_at'))}</div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const booking = row.original
      const router = useRouter()
      const supabase = createClient()
      const isDev = process.env.NODE_ENV !== 'production'

      const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm(`Are you sure you want to delete the booking for ${booking.first_name} ${booking.last_name}? This action cannot be undone.`)) {
          return
        }

        try {
          const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', booking.id)

          if (error) throw error
        } catch (error) {
          console.error('Error deleting booking:', error)
          alert('Failed to delete booking. Please try again.')
        }
      }

      return (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/bookings/${booking.id}`)
                }}
                className="cursor-pointer h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/bookings/${booking.id}/edit`)
                }}
                className="cursor-pointer h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
          {isDev && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
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
      )
    }
  }
]
