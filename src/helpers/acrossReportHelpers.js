import { useState } from 'react'
import { formatCellValue, formatColumnHeader, getSortIcon, sortData } from './acrossReportUtils'
import { REPORT_TYPE_VALUES } from './acrossReportConst'

const FIXED_COLUMNS_CONFIG = {
  [REPORT_TYPE_VALUES.quantitySold]: {
    enabled: true,
    fixedColumnCount: 2
  }
}

export const SortableTable = ({ reportType, reportData, grandTotal, sortableColumns = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  if (!reportData || reportData.length === 0) return null

  const allKeys = [...new Set(reportData.flatMap(item => Object.keys(item)))]
  let displayKeys = allKeys.filter(key => !key.startsWith('_'))

  const columns = displayKeys.map(key => ({
    key,
    label: formatColumnHeader(key),
    sort: Array.isArray(sortableColumns) && sortableColumns.includes(key)
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

  // Calculate cumulative widths for sticky positioning
  const getLeftPosition = columnIndex => {
    // You might want to measure actual widths, but for now using estimated width
    return columnIndex * 150 // Adjust based on your actual column widths
  }

  if (shouldUseFixedColumns) {
    return (
      <div className='relative overflow-x-auto max-h-[600px] overflow-y-auto'>
        <table
          className='border border-gray-200'
          style={{
            tableLayout: 'auto', // Allow columns to size based on content
            minWidth: '100%',
            position: 'relative' // Ensure proper stacking context
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
                      top: 0, // Sticky to top for all headers
                      ...(isFixed && {
                        left: getLeftPosition(index),
                        zIndex: 40 // Even higher z-index for fixed headers that are sticky in both directions
                      }),
                      ...(!isFixed && {
                        zIndex: 30 // Lower z-index for non-fixed headers
                      }),
                      backgroundColor: 'rgb(71 85 105)', // slate-600
                      height: '56px',
                      minWidth: '100px', // Minimum width
                      width: 'auto', // Allow width to adapt to content
                      whiteSpace: 'nowrap' // Prevent text wrapping
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
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => {
                  const isFixed = colIndex < fixedColumnsConfig.fixedColumnCount
                  return (
                    <td
                      key={column.key}
                      className='p-2 border border-gray-200 text-center'
                      style={{
                        ...(isFixed && {
                          position: 'sticky',
                          left: getLeftPosition(colIndex),
                          zIndex: 1, // Much lower z-index than headers
                          backgroundColor: 'var(--mui-palette-background-paper)'
                        }),
                        height: '50px', // Fixed height for all cells
                        minWidth: '100px',
                        width: 'auto',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={formatCellValue(row[column.key])} // Show full text on hover
                    >
                      {formatCellValue(row[column.key])}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          {grandTotal && (
            <tfoot>
              <tr>
                <td
                  className='p-2 border border-gray-200 text-center font-semibold'
                  style={{
                    position: 'sticky',
                    top: 0, // Also sticky to top
                    left: 0,
                    zIndex: 50, // Much higher z-index for intersection
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
                    top: 0, // Also sticky to top
                    left: getLeftPosition(1),
                    zIndex: 50, // Much higher z-index for intersection
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

  // Regular table layout remains the same
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
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td
                  key={column.key}
                  className='p-2 border border-gray-200 text-center'
                  style={{
                    height: '50px',
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
              ))}
            </tr>
          ))}
        </tbody>
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
