import { useState } from 'react'
import { formatCellValue, formatColumnHeader, getSortIcon, sortData } from './acrossReportUtils'

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
                className={`p-2 border min-w-[150px] border-gray-200 text-center font-semibold text-white ${
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
