'use client'

import { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Card, CardHeader, Typography, TextField, Button, IconButton, TablePagination, Divider } from '@mui/material'
import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import classnames from 'classnames'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

// Fuzzy filter function for search
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// Debounced input component for search
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const AllDataCashupSalesRecords = ({ users = [] }) => {
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const router = useRouter()

  // Initialize filtered data when users prop changes
  useEffect(() => {
    setFilteredData(users)
  }, [users])

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {row.original.email}
            </Typography>
          </div>
        ),
        enableSorting: true
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original.role || 'User'}
          </Typography>
        ),
        enableSorting: true
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Link
              href={{
                pathname: '/en/apps/user/allusersupdate/',
                query: {
                  user: JSON.stringify({
                    id: row.original.id,
                    name: row.original.name,
                    email: row.original.email,
                    role: row.original.role,
                    image: row.original.image,
                    plan: row.original.plan,
                    planActive: row.original.planActive,
                    planStartDate: row.original.planStartDate,
                    planEndDate: row.original.planEndDate
                  })
                }
              }}
              passHref
            >
              <Button variant='outlined' size='small' color='primary' className='mr-2'>
                Edit
              </Button>
            </Link>
            <Link
              href={{
                pathname: '/en/apps/user/user_permissions/',
                query: {
                  user: JSON.stringify({
                    id: row.original.id,
                    name: row.original.name,
                    email: row.original.email,
                    role: row.original.role,
                    image: row.original.image
                  })
                }
              }}
              passHref
            >
              <Button variant='outlined' size='small' color='secondary'>
                Permissions
              </Button>
            </Link>
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  // Initialize table
  const table = useReactTable({
    data: users,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter,
      pagination
    },
    onPaginationChange: setPagination,
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader title='All Users' />
      <Divider />
      <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
        <Button
          color='secondary'
          variant='outlined'
          startIcon={<i className='ri-upload-2-line text-xl' />}
          className='is-full sm:is-auto'
        >
          Export
        </Button>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Users'
          className='is-full sm:is-auto'
        />
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='ri-arrow-up-s-line text-xl' />,
                          desc: <i className='ri-arrow-down-s-line text-xl' />
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component='div'
        count={table.getFilteredRowModel().rows.length}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => {
          table.setPageSize(Number(e.target.value))
        }}
      />
    </Card>
  )
}

export default AllDataCashupSalesRecords
