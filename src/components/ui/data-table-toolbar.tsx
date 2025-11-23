'use client'

import { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '@/components/ui/data-table-view-options'
import { DataTableFacetedFilter } from '@/components/ui/data-table-faceted-filter'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumn?: string
  searchPlaceholder?: string
  filterColumns?: {
    column: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  actionButton?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchColumn = 'email',
  searchPlaceholder = 'Filter by email...',
  filterColumns = [],
  actionButton
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filterColumns.map((filter) => {
          const column = table.getColumn(filter.column)
          return column ? (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          ) : null
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        {actionButton}
      </div>
    </div>
  )
}
