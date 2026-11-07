import { useMemo, useState } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material'

import { getGroups } from './reportColumns'

// Display quantities with fractional precision and values with two decimal places.
const quantityFormat = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 4 })
const valueFormat = new Intl.NumberFormat('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Render branch/tier column groups while keeping product identifiers visible.
export default function TierReportTable({ report, visibleTiers }) {
  // Use null as the internal marker for the final All Stores column group.
  const [sort, setSort] = useState({ key: 'stockcode', direction: 'asc' })
  const groups = getGroups(visibleTiers)
  const branches = [...report.shops, null]

  // Sort a copy of the product rows so the backend response remains unchanged.
  const rows = useMemo(
    () =>
      [...report.data].sort((a, b) => {
        const result = String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''))

        return sort.direction === 'asc' ? result : -result
      }),
    [report.data, sort]
  )

  // Keep stock code and description fixed during horizontal scrolling.
  const sticky = (index, header = false) => ({
    position: 'sticky',
    left: index === 0 ? 0 : 150,
    minWidth: index === 0 ? 150 : 280,
    maxWidth: index === 0 ? 150 : 280,
    zIndex: header ? 4 : 2,
    backgroundColor: header ? '#475569' : 'background.paper'
  })

  // Reuse the same metric rendering for product rows and the grand-total row.
  const cells = (shops, totals) =>
    branches.flatMap(shop =>
      groups.flatMap(group => {
        const metrics = shop === null ? totals : shops[shop]

        return ['Qty', 'Value'].map(unit => (
          <TableCell
            key={`${shop ?? 'all'}-${group.key}-${unit}`}
            align='right'
            sx={{ minWidth: 105, whiteSpace: 'nowrap' }}
          >
            {(unit === 'Qty' ? quantityFormat : valueFormat).format(metrics?.[`${group.key}${unit}`] ?? 0)}
          </TableCell>
        ))
      })
    )

  // Constrain the table viewport while allowing comparison across many stores.
  return (
    <TableContainer
      sx={{ maxHeight: 600, border: '1px solid', borderColor: 'divider' }}
      tabIndex={0}
      aria-label='Tier report, scroll horizontally to compare stores'
    >
      <Table size='small' sx={{ '& thead th': { bgcolor: '#475569', color: 'white', whiteSpace: 'nowrap' } }}>
        {/* Build store, classification and quantity/value header levels. */}
        <TableHead sx={{ position: 'sticky', top: 0, zIndex: 3 }}>
          <TableRow>
            {['stockcode', 'stockdescription'].map((key, index) => (
              <TableCell key={key} rowSpan={3} sx={sticky(index, true)}>
                <TableSortLabel
                  active={sort.key === key}
                  direction={sort.direction}
                  sx={{ color: 'inherit !important' }}
                  onClick={() =>
                    setSort({ key, direction: sort.key === key && sort.direction === 'asc' ? 'desc' : 'asc' })
                  }
                >
                  {index === 0 ? 'Stock Code' : 'Stock Description'}
                </TableSortLabel>
              </TableCell>
            ))}
            {branches.map(shop => (
              <TableCell key={shop ?? 'all'} align='center' colSpan={groups.length * 2}>
                {shop ?? 'All Stores'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            {branches.flatMap(shop =>
              groups.map(group => (
                <TableCell key={`${shop}-${group.key}`} align='center' colSpan={2}>
                  {group.label}
                </TableCell>
              ))
            )}
          </TableRow>
          <TableRow>
            {branches.flatMap(shop =>
              groups.flatMap(group =>
                ['Qty', 'Value'].map(unit => (
                  <TableCell key={`${shop}-${group.key}-${unit}`} align='right'>
                    {unit}
                  </TableCell>
                ))
              )
            )}
          </TableRow>
        </TableHead>
        {/* Render all products followed by totals across the complete report. */}
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.stockcode ?? `null-${index}`}
              sx={{ bgcolor: index % 2 ? 'action.hover' : 'background.paper' }}
            >
              <TableCell sx={sticky(0)}>{row.stockcode ?? '(No stock code)'}</TableCell>
              <TableCell sx={sticky(1)}>{row.stockdescription}</TableCell>
              {cells(row.shops, row.totals)}
            </TableRow>
          ))}
          {/* Keep grand totals independent of product sorting and hidden classifications. */}
          <TableRow sx={{ '& td': { fontWeight: 700, bgcolor: 'action.selected' } }}>
            <TableCell sx={sticky(0)}>Grand Total</TableCell>
            <TableCell sx={sticky(1)} />
            {cells(report.branchTotals, report.totals)}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
