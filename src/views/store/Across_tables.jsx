/* eslint-disable padding-line-between-statements */
/* eslint-disable import/order */
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, Button, CircularProgress } from '@mui/material'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { copyToClipboard, exportCSV, exportExcel, printDocument, generatePDF } from '@/helpers/exportHelpers'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('Name', {
    cell: info => info.getValue(),
    header: 'Name'
  })
]

const AllDataAccrossRecords = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState([])
  const [grandTotal, setGrandTotal] = useState(0)
  const containerRef = useRef(null)
  const shopKey = useSelector(state => state.shopKey)
  const { data: session } = useSession()

  const search = useSearchParams()
  const shopKeys = search.get('shopKeys')

  const formatDate = date => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${year}${month}`
  }

  const startName = formatDate(startDate)
  const endName = formatDate(endDate)

  useEffect(() => {
    const filtered = data.filter(item => {
      const itemName = item.Name.toLowerCase()
      const startNameMatch = startName ? itemName >= startName.toLowerCase() : true
      const endNameMatch = endName ? itemName <= endName.toLowerCase() : true
      return startNameMatch && endNameMatch
    })
    setFilteredData(filtered)
  }, [data, startName, endName])

  const table = useReactTable({
    data: filteredData.length > 0 ? filteredData : data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    setIsLoading(true)
    try {
      const token = `Bearer ${session.user.token}`
      const config = { headers: { Authorization: token } }
      const formattedStartDate = startDate.toISOString().split('T')[0]
      const formattedEndDate = endDate.toISOString().split('T')[0]

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/accrossShopReport?startDate=${formattedStartDate}&endDate=${formattedEndDate}&shopKeys=${shopKeys}`

      const response = await axios.get(apiUrl, config)
      setReportData(response.data.finalResults || [])
      setGrandTotal(response.data.grandTotalQty)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = type => {
    const table = document.querySelector('#tableContainer table')
    if (!table) return

    switch (type) {
      case 'copy':
        copyToClipboard(table)
        break
      case 'csv':
        exportCSV(table)
        break
      case 'excel':
        exportExcel(table)
        break
      case 'pdf':
        generatePDF(containerRef)
        break
      case 'print':
        printDocument()
        break
      default:
        break
    }
  }

  return (
    <Card className='p-4' ref={containerRef} id='main'>
      <CardHeader title={`${shopKeys.toUpperCase()} Across Report`} />
      <div className='p-6'>
        <div className='flex flex-col items-center'>
          <div className='flex-1 flex items-end h-[120px] gap-4 mb-5'>
            <div className='flex-1'>
              <label htmlFor='start' className='form-label  font-semibold block mb-2'>
                <b>Start Date:</b>
              </label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                dateFormat='yyyy-MM-dd'
                placeholderText='YYYY-MM-DD'
                className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full'
              />
            </div>
            <div className='flex-1'>
              <label htmlFor='end' className='form-label  font-semibold block mb-2'>
                <b>End Date:</b>
              </label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                dateFormat='yyyy-MM-dd'
                placeholderText='YYYY-MM-DD'
                className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full'
              />
            </div>
            <Button
              variant='contained'
              color='primary'
              onClick={generateReport}
              disabled={isLoading}
              className='min-w-[120px]'
            >
              {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Generate Report'}
            </Button>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex gap-2' id='ActionsButtons'>
              <Button variant='outlined' onClick={() => handleExport('copy')} className='min-w-[80px]'>
                Copy
              </Button>
              <Button variant='outlined' onClick={() => handleExport('csv')} className='min-w-[80px]'>
                CSV
              </Button>
              <Button variant='outlined' onClick={() => handleExport('excel')} className='min-w-[80px]'>
                Excel
              </Button>
              <Button variant='outlined' onClick={() => handleExport('pdf')} className='min-w-[80px]'>
                PDF
              </Button>
              <Button variant='outlined' onClick={() => handleExport('print')} className='min-w-[80px]'>
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {reportData.length > 0 && (
        <div id='tableContainer' className='overflow-x-auto'>
          <table className='min-w-full border border-gray-200'>
            <thead className='bg-slate-600'>
              <tr>
                {Object.keys(reportData[0]).map(key => (
                  <th key={key} className='p-2 border border-gray-200 text-center font-semibold'>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className='p-2 border border-gray-200 text-center'>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={Object.keys(reportData[0]).length - 1}
                  className='p-2 border border-gray-200 text-center font-semibold'
                >
                  Total Qty
                </td>
                <td className='p-2 border border-gray-200 text-center font-semibold'>{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  )
}

export default AllDataAccrossRecords
