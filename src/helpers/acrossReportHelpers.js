export const REPORT_TYPE_VALUES = {
  stock: 'stock',
  turnover: 'turnover'
}

export const REPORT_TYPES = [
  { value: 'stock', label: 'Stock Report' },
  { value: 'turnover', label: 'Turnover Report' }
  // { value: 'inventory', label: 'Inventory Report' },
  // { value: 'price', label: 'Price Change Report' },
  // { value: 'stock', label: 'Stock Movement Report' }
]

export const getReportTypeLabel = type => {
  const reportTypes = {
    stock: 'Stock Report',
    turnover: 'Turnover Report'
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
      { key: 'stockcode', label: 'Stock Code' },
      { key: 'description', label: 'Description' },
      { key: 'totalQty', label: 'Total Quantity' },
      { key: 'unit', label: 'Unit' },
      { key: 'price', label: 'Price' }
    ],
    footer: {
      showTotal: true,
      totalKey: 'totalQty',
      totalLabel: 'Total Qty'
    }
  },
  sales: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'stockcode', label: 'Stock Code' },
      { key: 'description', label: 'Description' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'unit', label: 'Unit' },
      { key: 'price', label: 'Price' },
      { key: 'total', label: 'Total Amount' }
    ],
    footer: {
      showTotal: true,
      totalKey: 'total',
      totalLabel: 'Total Sales'
    }
  },
  inventory: {
    columns: [
      { key: 'stockcode', label: 'Stock Code' },
      { key: 'description', label: 'Description' },
      { key: 'currentStock', label: 'Current Stock' },
      { key: 'minimumStock', label: 'Minimum Stock' },
      { key: 'maximumStock', label: 'Maximum Stock' },
      { key: 'reorderPoint', label: 'Reorder Point' }
    ],
    footer: {
      showTotal: false
    }
  },
  price: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'stockcode', label: 'Stock Code' },
      { key: 'description', label: 'Description' },
      { key: 'oldPrice', label: 'Old Price' },
      { key: 'newPrice', label: 'New Price' },
      { key: 'changePercentage', label: 'Change %' }
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

export const generateTableJSX = (reportType, reportData, grandTotal) => {
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
