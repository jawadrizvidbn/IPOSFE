/* eslint-disable padding-line-between-statements */
/* eslint-disable import/order */
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader } from '@mui/material'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('Name', {
    cell: info => info.getValue(),
    header: 'Name'
  })
]

const AllDataAccrossRecords = () => {
  const [data, setData] = useState([]) // Assume data is fetched from somewhere else
  const [filteredData, setFilteredData] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const shopKey = useSelector(state => state.shopKey)

  const search = useSearchParams()
  const shopKeys = search.get('shopKeys')

  const formatDate = date => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    // eslint-disable-next-line newline-before-return
    return `${year}${month}`
  }

  const startName = formatDate(startDate)
  const endName = formatDate(endDate)

  useEffect(() => {
    const filtered = data.filter(item => {
      const itemName = item.Name.toLowerCase()
      const startNameMatch = startName ? itemName >= startName.toLowerCase() : true
      const endNameMatch = endName ? itemName <= endName.toLowerCase() : true
      // eslint-disable-next-line padding-line-between-statements, newline-before-return
      return startNameMatch && endNameMatch
    })
    setFilteredData(filtered)
  }, [data, startName, endName])

  const table = useReactTable({
    data: filteredData.length > 0 ? filteredData : data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const exportToReport = () => {
    const names = filteredData.map(row => row.Name).filter(name => name)
    const nameQueryString = names.length > 0 ? `id=${names.join(',')}` : ''
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : ''
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : ''
    const queryString = `${nameQueryString}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&shopKeys=${shopKeys}`
    window.location.href = `/en/Across_Report?${queryString}`
  }

  return (
    <Card className='p-4'>
      <CardHeader title={`${shopKeys.toUpperCase()} Across Data Table`} />
      <div className='p-6'>
        <div className='flex flex-col md:flex-row items-center md:justify-between mb-4'>
          <div className='mb-2 md:mb-0 flex-1 md:text-center md:mr-2'>
            <label htmlFor='start' className='form-label text-gray-700 font-semibold'>
              <b>Start Date:</b>
            </label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              dateFormat='yyyy-MM-dd'
              placeholderText='YYYY-MM-DD'
              className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ml-2'
            />
          </div>
          <div className='flex-1 md:text-center md:ml-2'>
            <label htmlFor='end' className='form-label text-gray-700 font-semibold'>
              <b>End Date:</b>
            </label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              dateFormat='yyyy-MM-dd'
              placeholderText='YYYY-MM-DD'
              className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ml-2'
            />
          </div>
        </div>
      </div>
      <div className='mb-4 flex justify-end'>
        <button
          onClick={exportToReport}
          className='ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:bg-blue-600'
        >
          Export to Report
        </button>
      </div>
    </Card>
  )
}

export default AllDataAccrossRecords
