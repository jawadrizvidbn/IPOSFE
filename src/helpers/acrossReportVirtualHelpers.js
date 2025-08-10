import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { formatCellValue, formatColumnHeader, getSortIcon, sortData } from './acrossReportUtils'
import { REPORT_TYPE_VALUES } from './acrossReportConst'

// -----------------------------
// Config (as in your original)
// -----------------------------
const FIXED_COLUMNS_CONFIG = {
  [REPORT_TYPE_VALUES.quantitySold]: { enabled: true, fixedColumnCount: 2 },
  [REPORT_TYPE_VALUES.products]: { enabled: true, fixedColumnCount: 2 },
  [REPORT_TYPE_VALUES.retailWholesale]: { enabled: true, fixedColumnCount: 2 },
  [REPORT_TYPE_VALUES.stockOnHand]: { enabled: true, fixedColumnCount: 2 },
  [REPORT_TYPE_VALUES.dailySales]: { enabled: true, fixedColumnCount: 1 },
  [REPORT_TYPE_VALUES.invoice]: { enabled: true, fixedColumnCount: 1 }
}

// ==========================================================
// Virtualized <tbody> for a real table (no react-window)
// - Renders only visible rows + spacer rows top/bottom
// - Requires fixed row height
// - Keeps sticky-left columns working using your getLeftPosition()
// ==========================================================
function VirtualTBodyTable({
  rows, // array of row objects
  columns, // [{ key, label }, ...]
  fixedCount = 0, // sticky-left columns count
  rowHeight = 50, // px; must match your cell CSS
  height = 600, // px; viewport height of scroll container
  getLeftPosition, // cumulative left offset per column
  formatCellValue, // formatter
  tableContainerId = 'tableContainer', // scroll container id
  overscan = 6 // extra rows above/below for smoothness
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current || document.getElementById(tableContainerId)
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop || 0)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableContainerId])

  const total = rows.length
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex = Math.min(total, Math.ceil((scrollTop + height) / rowHeight) + overscan)

  const visible = useMemo(() => rows.slice(startIndex, endIndex), [rows, startIndex, endIndex])

  const topPad = startIndex * rowHeight
  const bottomPad = (total - endIndex) * rowHeight

  const renderCell = useCallback(
    (row, colIndex, column) => {
      const isFixed = colIndex < fixedCount
      return (
        <td
          key={column.key}
          className='p-2 border border-gray-200 text-center'
          style={{
            ...(isFixed && {
              position: 'sticky',
              left: getLeftPosition(colIndex),
              zIndex: 1, // below header z-index
              backgroundColor: 'var(--mui-palette-background-paper)'
            }),
            height: `${rowHeight}px`,
            minWidth: '100px',
            width: 'auto',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={formatCellValue(row[column.key])}
        >
          {formatCellValue(row[column.key])}
        </td>
      )
    },
    [fixedCount, getLeftPosition, rowHeight]
  )

  return (
    <tbody>
      {/* Top spacer */}
      {topPad > 0 && (
        <tr aria-hidden='true'>
          <td colSpan={columns.length} style={{ padding: 0, border: 0, height: topPad }} />
        </tr>
      )}

      {/* Visible rows */}
      {visible.map((row, i) => {
        const realIndex = startIndex + i
        return <tr key={realIndex}>{columns.map((column, colIndex) => renderCell(row, colIndex, column))}</tr>
      })}

      {/* Bottom spacer */}
      {bottomPad > 0 && (
        <tr aria-hidden='true'>
          <td colSpan={columns.length} style={{ padding: 0, border: 0, height: bottomPad }} />
        </tr>
      )}
    </tbody>
  )
}

// ======================================
// Main component (your SortableTable)
// ======================================
export const SortableVirtualTable = ({ reportType, reportData, grandTotal, sortableColumns = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  if (!reportData || reportData.length === 0) return null

  // Derive columns from data keys (same as your code)
  const allKeys = [...new Set(reportData.flatMap(item => Object.keys(item)))]
  let displayKeys = allKeys.filter(key => !key.startsWith('_'))

  const columns = displayKeys.map(key => ({
    key,
    label: formatColumnHeader(key),
    // sort: Array.isArray(sortableColumns) && sortableColumns.includes(key)
    sort: true
  }))

  const fixedColumnsConfig = FIXED_COLUMNS_CONFIG[reportType]
  const shouldUseFixedColumns = fixedColumnsConfig?.enabled && fixedColumnsConfig.fixedColumnCount > 0

  const handleSort = (columnKey, canSort) => {
    if (!canSort) return
    let direction = 'asc'
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: columnKey, direction })
  }

  const sortedData = sortData(reportData, sortConfig)

  // Estimated left offset for sticky columns (replace with real widths if needed)
  const getLeftPosition = columnIndex => {
    // If every column is ~100px min, this works. For perfect alignment,
    // measure header cell widths and sum them.
    return columnIndex * 100
  }

  // ------- Fixed-columns branch with virtualization -------
  if (shouldUseFixedColumns) {
    return (
      <div id='tableContainer' className='relative overflow-x-auto max-h-[600px] overflow-y-auto'>
        <table
          className='border border-gray-200'
          style={{
            tableLayout: 'auto',
            minWidth: '100%',
            position: 'relative'
          }}
        >
          <thead className='bg-slate-600 sticky top-0 z-10'>
            <tr>
              {columns.map((column, index) => {
                const isFixed = index < fixedColumnsConfig.fixedColumnCount
                return (
                  <th
                    key={column.key}
                    className={`p-2 border border-gray-200 text-center font-semibold text-white ${
                      column.sort ? 'cursor-pointer hover:bg-slate-700 select-none' : ''
                    }`}
                    style={{
                      position: 'sticky',
                      top: 0,
                      ...(isFixed && {
                        left: getLeftPosition(index),
                        zIndex: 40
                      }),
                      ...(!isFixed && { zIndex: 30 }),
                      backgroundColor: 'rgb(71 85 105)',
                      height: '56px',
                      minWidth: '100px',
                      width: 'auto',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => handleSort(column.key, column.sort)}
                    title={column.sort ? 'Click to sort' : ''}
                  >
                    <div className='flex items-center justify-center gap-1'>
                      <span>{column.label}</span>
                      {column.sort && <span className='text-xs opacity-70'>{getSortIcon(column.key, sortConfig)}</span>}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <VirtualTBodyTable
            rows={sortedData}
            columns={columns}
            fixedCount={fixedColumnsConfig.fixedColumnCount}
            getLeftPosition={getLeftPosition}
            formatCellValue={formatCellValue}
            rowHeight={50}
            height={600}
            tableContainerId='tableContainer'
          />

          {grandTotal && (
            <tfoot>
              <tr>
                <td
                  className='p-2 border border-gray-200 text-center font-semibold'
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 50,
                    backgroundColor: 'var(--mui-palette-background-paper)',
                    height: '50px'
                  }}
                >
                  Total
                </td>
                <td
                  className='p-2 border border-gray-200 text-center font-semibold'
                  style={{
                    position: 'sticky',
                    left: getLeftPosition(1),
                    zIndex: 50,
                    backgroundColor: 'var(--mui-palette-background-paper)',
                    height: '50px'
                  }}
                >
                  {formatCellValue(grandTotal)}
                </td>
                {columns.slice(2).map((column, index) => (
                  <td
                    key={column.key}
                    className='p-2 border border-gray-200 text-center font-semibold'
                    style={{ height: '50px' }}
                  >
                    {index === columns.length - 3 ? formatCellValue(grandTotal) : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    )
  }

  // ------- Regular (no fixed columns) branch with virtualization -------
  return (
    <div id='tableContainer' className='overflow-x-auto max-h-[600px] overflow-y-auto'>
      <table className='min-w-full border border-gray-200' style={{ tableLayout: 'auto' }}>
        <thead className='bg-slate-600 sticky top-0 z-10'>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={`p-2 border border-gray-200 text-center font-semibold text-white ${
                  column.sort ? 'cursor-pointer hover:bg-slate-700 select-none' : ''
                }`}
                style={{
                  height: '56px',
                  minWidth: '100px',
                  width: 'auto',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => handleSort(column.key, column.sort)}
                title={column.sort ? 'Click to sort' : ''}
              >
                <div className='flex items-center justify-center gap-1'>
                  <span>{column.label}</span>
                  {column.sort && <span className='text-xs opacity-70'>{getSortIcon(column.key, sortConfig)}</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <VirtualTBodyTable
          rows={sortedData}
          columns={columns}
          fixedCount={0}
          getLeftPosition={() => 0}
          formatCellValue={formatCellValue}
          rowHeight={50}
          height={600}
          tableContainerId='tableContainer'
        />

        {grandTotal && (
          <tfoot>
            <tr>
              <td
                colSpan={columns.length - 1}
                className='p-2 border border-gray-200 text-center font-semibold'
                style={{ height: '50px' }}
              >
                Total
              </td>
              <td className='p-2 border border-gray-200 text-center font-semibold' style={{ height: '50px' }}>
                {formatCellValue(grandTotal)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
