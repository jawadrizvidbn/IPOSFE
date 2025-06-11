import { useState } from 'react'

export const REPORT_TYPE_VALUES = {
  stock: 'stock',
  turnover: 'turnover',
  products: 'products'
}

export const REPORT_TYPES = [
  { value: 'stock', label: 'Stock Report' },
  { value: 'turnover', label: 'Turnover Report' },
  { value: 'products', label: 'Products Report' }
  // { value: 'inventory', label: 'Inventory Report' },
  // { value: 'price', label: 'Price Change Report' },
  // { value: 'stock', label: 'Stock Movement Report' }
]

export const getReportTypeLabel = type => {
  const reportTypes = {
    stock: 'Stock Report',
    turnover: 'Turnover Report',
    products: 'Products Report'
    // sales: 'Sales Report',
    // inventory: 'Inventory Report',
    // price: 'Price Change Report',
    // stock: 'Stock Movement Report'
  }
  return reportTypes[type] || type
}

// Table configurations for different report types
export const TABLE_CONFIGS = {
  stock: {
    columns: [
      { key: 'stockcode', label: 'Stock Code', sort: true },
      { key: 'description', label: 'Description', sort: true },
      { key: 'totalQty', label: 'Total Quantity', sort: true },
      { key: 'unit', label: 'Unit', sort: false },
      { key: 'price', label: 'Price', sort: true }
    ],
    footer: {
      showTotal: true,
      totalKey: 'totalQty',
      totalLabel: 'Total Qty'
    }
  },
  turnover: {
    columns: [
      { key: 'date', label: 'Date', sort: true },
      { key: 'stockcode', label: 'Stock Code', sort: true },
      { key: 'description', label: 'Description', sort: true },
      { key: 'quantity', label: 'Quantity', sort: true },
      { key: 'unit', label: 'Unit', sort: false },
      { key: 'price', label: 'Price', sort: true },
      { key: 'total', label: 'Total Amount', sort: true }
    ],
    footer: {
      showTotal: true,
      totalKey: 'total',
      totalLabel: 'Total Sales'
    }
  },
  products: {
    columns: [
      { key: 'stockcode', label: 'Stock Code', sort: true },
      { key: 'description', label: 'Description', sort: true },
      { key: 'category', label: 'Category', sort: true },
      { key: 'price', label: 'Price', sort: true },
      { key: 'status', label: 'Status', sort: false }
    ],
    footer: {
      showTotal: false
    }
  },
  sales: {
    columns: [
      { key: 'date', label: 'Date', sort: true },
      { key: 'stockcode', label: 'Stock Code', sort: true },
      { key: 'description', label: 'Description', sort: true },
      { key: 'quantity', label: 'Quantity', sort: true },
      { key: 'unit', label: 'Unit', sort: false },
      { key: 'price', label: 'Price', sort: true },
      { key: 'total', label: 'Total Amount', sort: true }
    ],
    footer: {
      showTotal: true,
      totalKey: 'total',
      totalLabel: 'Total Sales'
    }
  },
  inventory: {
    columns: [
      { key: 'stockcode', label: 'Stock Code', sort: true },
      { key: 'description', label: 'Description', sort: true },
      { key: 'currentStock', label: 'Current Stock', sort: true },
      { key: 'minimumStock', label: 'Minimum Stock', sort: true },
      { key: 'maximumStock', label: 'Maximum Stock', sort: true },
      { key: 'reorderPoint', label: 'Reorder Point', sort: true }
    ],
    footer: {
      showTotal: false
    }
  },
  price: {
    columns: [
      { key: 'date', label: 'Date', sort: true },
      { key: 'stockcode', label: 'Stock Code', sort: true },
      { key: 'description', label: 'Description', sort: true },
      { key: 'oldPrice', label: 'Old Price', sort: true },
      { key: 'newPrice', label: 'New Price', sort: true },
      { key: 'changePercentage', label: 'Change %', sort: true }
    ],
    footer: {
      showTotal: false
    }
  }
}

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
  console.log({ sortableColumns })
  // Create columns with sortable configuration
  const columns = displayKeys.map(key => ({
    key,
    label: formatColumnHeader(key),
    sort: Array.isArray(sortableColumns) && sortableColumns.includes(key) // If sortableColumns provided, use it; otherwise all sortable
  }))
  console.log(columns)
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

// Legacy function - updated to suggest using SortableTable component
export const generateTableJSX = (reportType, reportData, grandTotal) => {
  console.warn('generateTableJSX is deprecated. Please use the SortableTable component for sorting functionality.')

  if (!reportData || reportData.length === 0) return null

  // Get all unique keys from the data
  const allKeys = [...new Set(reportData.flatMap(item => Object.keys(item)))]

  // Filter out any internal or system fields if needed
  const displayKeys = allKeys.filter(key => !key.startsWith('_'))

  return (
    <div id='tableContainer' className='overflow-x-auto'>
      <table className='min-w-full border border-gray-200'>
        <thead className='bg-slate-600'>
          <tr>
            {displayKeys.map(key => (
              <th key={key} className='p-2 border border-gray-200 text-center font-semibold text-white'>
                {formatColumnHeader(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index}>
              {displayKeys.map(key => (
                <td key={key} className='p-2 border border-gray-200 text-center'>
                  {formatCellValue(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {grandTotal && (
          <tfoot>
            <tr>
              <td colSpan={displayKeys.length - 1} className='p-2 border border-gray-200 text-center font-semibold'>
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
