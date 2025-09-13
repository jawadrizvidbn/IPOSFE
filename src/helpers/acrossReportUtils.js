import { format } from 'date-fns'

export const formatColumnHeader = key => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

export const sortData = (data, sortConfig) => {
  if (!sortConfig.key) return data

  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === 'string' && aValue.match(/^\d{4}-\d{2}-\d{2}/)) {
      const dateA = new Date(aValue)
      const dateB = new Date(bValue)
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
    }

    const stringA = String(aValue).toLowerCase()
    const stringB = String(bValue).toLowerCase()

    if (sortConfig.direction === 'asc') {
      return stringA < stringB ? -1 : stringA > stringB ? 1 : 0
    } else {
      return stringA > stringB ? -1 : stringA < stringB ? 1 : 0
    }
  })
}

export const getSortIcon = (columnKey, sortConfig) => {
  if (sortConfig.key !== columnKey) {
    return '↕️'
  }
  return sortConfig.direction === 'asc' ? '↑' : '↓'
}

function formatISOAsUTC(isoString, dateFormat = 'yyyy-MM-dd HH:mm:ss') {
  const date = new Date(isoString)

  // Create a UTC-adjusted Date object (neutralizing local timezone shift)
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)

  return format(utcDate, dateFormat)
}

// Helper function to format cell values
export const formatCellValue = value => {
  if (value === null || value === undefined) return '-'

  // Format numbers with commas
  if (typeof value === 'number') {
    return value.toLocaleString()
  }

  // Format dates if they're in ISO format
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/)) {
    return formatISOAsUTC(value)
  }

  return value
}
