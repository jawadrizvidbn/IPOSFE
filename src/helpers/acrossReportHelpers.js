import { useState } from 'react'

// Helper function to format column headers
const formatColumnHeader = key => {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim()
}

// Sorting function
export const sortData = (data, sortConfig) => {
  if (!sortConfig.key) return data

  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    // Handle different data types
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    // Handle dates
    if (typeof aValue === 'string' && aValue.match(/^\d{4}-\d{2}-\d{2}/)) {
      const dateA = new Date(aValue)
      const dateB = new Date(bValue)
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
    }

    // Handle strings
    const stringA = String(aValue).toLowerCase()
    const stringB = String(bValue).toLowerCase()

    if (sortConfig.direction === 'asc') {
      return stringA < stringB ? -1 : stringA > stringB ? 1 : 0
    } else {
      return stringA > stringB ? -1 : stringA < stringB ? 1 : 0
    }
  })
}

// Get sort icon based on current sort state
export const getSortIcon = (columnKey, sortConfig) => {
  if (sortConfig.key !== columnKey) {
    return '↕️' // Default sort icon
  }
  return sortConfig.direction === 'asc' ? '↑' : '↓'
}

// Component for sortable table (use this in your React component)
export const SortableTable = ({ reportType, reportData, grandTotal, sortableColumns = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  if (!reportData || reportData.length === 0) return null

  // Generate columns dynamically from data
  const allKeys = [...new Set(reportData.flatMap(item => Object.keys(item)))]
  const displayKeys = allKeys.filter(key => !key.startsWith('_'))
  // Create columns with sortable configuration
  const columns = displayKeys.map(key => ({
    key,
    label: formatColumnHeader(key),
    sort: Array.isArray(sortableColumns) && sortableColumns.includes(key) // If sortableColumns provided, use it; otherwise all sortable
  }))
  const handleSort = (columnKey, canSort) => {
    if (!canSort) return

    let direction = 'asc'
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: columnKey, direction })
  }

  const sortedData = sortData(reportData, sortConfig)

  return (
    <div id='tableContainer' className='overflow-x-auto'>
      <table className='min-w-full border border-gray-200'>
        <thead className='bg-slate-600'>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={`p-2 border border-gray-200 text-center font-semibold text-white ${
                  column.sort ? 'cursor-pointer hover:bg-slate-700 select-none' : ''
                }`}
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
                <td key={column.key} className='p-2 border border-gray-200 text-center'>
                  {formatCellValue(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {grandTotal && (
          <tfoot>
            <tr>
              <td colSpan={columns.length - 1} className='p-2 border border-gray-200 text-center font-semibold'>
                Total
              </td>
              <td className='p-2 border border-gray-200 text-center font-semibold'>{formatCellValue(grandTotal)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

// Helper function to format cell values
const formatCellValue = value => {
  if (value === null || value === undefined) return '-'

  // Format numbers with commas
  if (typeof value === 'number') {
    return value.toLocaleString()
  }

  // Format dates if they're in ISO format
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    return new Date(value).toLocaleDateString()
  }

  return value
}
