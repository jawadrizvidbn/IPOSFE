'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Card, CardHeader } from '@mui/material'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { signOut, useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import { getLocalizedUrl } from '@/utils/i18n'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('Name', {
    cell: info => info.getValue(),
    header: 'Name'
  })
]

const AllCreditorsPaymentTablesRecord = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const { data: session } = useSession()
  const router = useRouter()
  const search = useSearchParams()
  const shopKey = search.get('shopKey')
  const [isDateValid, setIsDateValid] = useState(false) // State to track if valid date range is selected

  const formatDate = date => {
    if (!date) return '' // Return empty string if no date is selected
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')

    return `${year}${month}tbldata_creditors_tran`
  }

  const startName = formatDate(startDate)
  const endName = formatDate(endDate)

  useEffect(() => {
    const validateDateRange = async () => {
      if (!startDate || !endDate) {
        setIsDateValid(false)

        return
      }

      setLoading(true)

      try {
        const token = `Bearer ${session.user.token}`
        const config = { headers: { Authorization: token } }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/tblDataCreditorsTran`

        const response = await axios.get(apiUrl, {
          params: {
            shopKey,
            startName,
            endName
          },
          headers: config.headers
        })

        const data = response.data

        // Check if both startName and endName exist in the response data
        const startNameExists = data.some(item => item.Name === startName)
        const endNameExists = data.some(item => item.Name === endName)

        if (startNameExists && endNameExists) {
          setIsDateValid(true) // Valid date range
          setData(data)
          setError(null)
        } else {
          setIsDateValid(false) // Invalid date range
          setError(new Error(`Selected dates are not available in the records.`))
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          signOut({ redirect: false })
          router.push(getLocalizedUrl('/login', 'en'))

          return
        } else {
          console.error('Error validating date range:', error)
          setIsDateValid(false)
          setError(new Error(`Error validating date range ${startName} to ${endName}: ${error.message}`))
        }
      } finally {
        setLoading(false)
      }
    }

    // Validate date range whenever startDate or endDate changes
    if (startDate && endDate) {
      validateDateRange()
    }
  }, [startDate, endDate, session?.user?.token, startName, endName, router, shopKey]) // Trigger useEffect when startDate or endDate changes

  useEffect(() => {
    if (data.length > 0) {
      const filtered = data.filter(item => {
        const itemName = item.Name.toLowerCase()
        const startNameMatch = startName ? itemName >= startName.toLowerCase() : true
        const endNameMatch = endName ? itemName <= endName.toLowerCase() : true

        return startNameMatch && endNameMatch
      })

      setFilteredData(filtered)
    }
  }, [data, startName, endName])

  const table = useReactTable({
    data: filteredData.length > 0 ? filteredData : data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const exportToReport = () => {
    if (!isDateValid) return // Prevent export if date range is not valid

    const rowsToExport = filteredData.length > 0 ? filteredData : data
    const names = rowsToExport.map(row => row.Name).filter(name => name)
    const nameQueryString = names.length > 0 ? `id=${names.join(',')}` : ''

    const formatDate = date => {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0') // Add leading zero
      const day = String(d.getDate()).padStart(2, '0') // Add leading zero

      return `${year}-${month}-${day}`
    }

    const formattedStartDate = startDate ? formatDate(startDate) : ''
    const formattedEndDate = endDate ? formatDate(endDate) : ''

    // Construct the URL with date and name query strings
    const queryString = `${nameQueryString}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`

    window.location.href = `/en/CreditorPayment_Report?${queryString}`
  }

  return (
    <Card className='p-4'>
      <CardHeader title={`${shopKey.toUpperCase()} Creditor Payments Data Table`} />
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
      {loading && <div className='text-blue-500 mb-4'>Loading data, please wait...</div>}
      {error && <div className={`text-red-500 mb-4`}>{error.message}</div>} {/* Display error in red */}
      <div className='mb-4 flex justify-end'>
        <button
          onClick={exportToReport}
          className={`ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm ${
            !isDateValid || !startDate || !endDate
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600 focus:outline-none focus:bg-blue-600'
          }`}
          disabled={!isDateValid || !startDate || !endDate} // Disable button if date range is not valid or dates are not selected
        >
          Export to Report
        </button>
      </div>
    </Card>
  )
}

export default AllCreditorsPaymentTablesRecord
