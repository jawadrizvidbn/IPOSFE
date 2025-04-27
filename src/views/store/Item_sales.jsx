'use client'

import React, { useState, useRef, useEffect } from 'react'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useSession, signOut } from 'next-auth/react'
import axios from 'axios'
import { useSelector } from 'react-redux'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'

import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'

import styles from '@core/styles/table.module.css'
import email from '../../../public/Assets/email.png'
import phone from '../../../public/Assets/phone.png'

const columnHelper = createColumnHelper()

const ColumnVisibility = () => {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [sorting, setSorting] = useState([]) // State for sorting
  const [companyDetails, setCompanyDetails] = useState({})
  const containerRef = useRef(null)
  const { data: session, status: sessionStatus } = useSession()
  const [earliestDate, setEarliestDate] = useState('')
  const [latestDate, setLatestDate] = useState('')
  const searchParams = useSearchParams()
  const [showMenu, setShowMenu] = useState(false)
  const [activeColumn, setActiveColumn] = useState(null)
  const queryString = new URLSearchParams(searchParams).toString()
  const id = new URLSearchParams(searchParams).get('id') // Extracting the id parameter value
  const startDateFromURL = searchParams.get('startDate') || '' // Default to empty if not found
  const endDateFromURL = searchParams.get('endDate') || '' // Default to empty if not found
  const [clickedButtons, setClickedButtons] = useState({})
  const router = useRouter()
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  // Get shopKey from Redux store
  const shopKey = searchParams.get('shopKey')

  useEffect(() => {
    if (startDateFromURL) {
      setFilterStartDate(startDateFromURL) // Set filterStartDate to the value from URL
    }

    if (endDateFromURL) {
      setFilterEndDate(endDateFromURL) // Set filterEndDate to the value from URL
    }
  }, [startDateFromURL, endDateFromURL]) // Re-run if URL params change

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        if (sessionStatus !== 'authenticated') {
          console.error('Session data not available')

          return
        }

        const token = `Bearer ${session.user.token}`
        const config = { headers: { Authorization: token } }
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/tblReg?shopKey=${shopKey}`

        console.log('Fetching company details from URL:', apiUrl)
        const response = await axios.get(apiUrl, config)

        if (Array.isArray(response.data) && response.data.length > 0) {
          setCompanyDetails(response.data[0])
        } else {
          console.error('Empty or invalid response data')
        }
      } catch (error) {
        console.error('Error fetching company data:', error)
      }
    }

    fetchCompanyDetails()
  }, [shopKey, sessionStatus])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (sessionStatus !== 'authenticated') {
          console.error('Session data not available')

          return
        }

        const token = session?.user?.id ? `Bearer ${session.user.token}` : ''
        const config = { headers: { Authorization: token } }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/departmentsSalesReports?tableNames=${id}&shopKey=${shopKey}`

        const response = await axios.get(apiUrl, config)

        let history_item_sale = []
        let earliestDate = null
        let latestDate = null

        response.data.forEach(item => {
          if (item.report && item.report.formattedStockCodes) {
            history_item_sale.push(
              ...item.report.formattedStockCodes.map(code => ({
                ...code,
                earliestDate: item.report.earliestDate,
                latestDate: item.report.latestDate
              }))
            )
          }

          if (item.report && item.report.earliestDate) {
            earliestDate = item.report.earliestDate
          }

          if (item.report && item.report.latestDate) {
            latestDate = item.report.latestDate
          }
        })
        setData(history_item_sale)
        setEarliestDate(earliestDate)
        setLatestDate(latestDate)

        const customColumns = [
          columnHelper.accessor('stockcode', {
            id: 'stockcode',
            cell: info => info.getValue(),
            header: 'Stock Code',
            sortDescFirst: false
          }),
          columnHelper.accessor('stockdescription', {
            id: 'stockdescription',
            cell: info => info.getValue(),
            header: 'Description',
            sortDescFirst: false
          }),
          columnHelper.accessor('type', {
            id: 'type',
            cell: info => info.getValue(),
            header: 'Type',
            sortDescFirst: false
          }),
          columnHelper.accessor('size', {
            id: 'size',
            cell: info => info.getValue(),
            header: 'Size',
            sortDescFirst: false
          }),
          columnHelper.accessor('totalQuantity', {
            id: 'totalQuantity',
            cell: info => info.getValue(),
            header: 'Qty',
            sortDescFirst: false
          }),
          columnHelper.accessor('totalCostPrice', {
            id: 'totalCostPrice',
            cell: info => info.getValue(),
            header: 'T Cost',
            sortDescFirst: false
          }),
          columnHelper.accessor('totalSelling', {
            id: 'totalSelling',
            cell: info => info.getValue(),
            header: 'T Selling',
            sortDescFirst: false
          }),
          columnHelper.accessor('totalGPP', {
            id: 'totalGPP',
            cell: info => info.getValue(),
            header: 'GP%',
            sortDescFirst: false
          }),
          columnHelper.accessor('totalGpValue', {
            id: 'totalGpValue',
            cell: info => info.getValue(),
            header: 'GPV',
            sortDescFirst: false
          })
        ]

        // Set columns and default visibility
        setColumns(customColumns)
        const visibility = {}
        const clickedState = {}

        customColumns.forEach((column, index) => {
          visibility[column.id] = index < 5 // Show only the first eight columns by default
          clickedState[column.id] = index < 5 // Set clicked state for the first five columns
        })

        setColumnVisibility(visibility)
        setClickedButtons(clickedState)
        setData(history_item_sale)
      } catch (error) {
        console.error('Error fetching or setting sales data:', error)

        if (error.response && error.response.status === 401) {
          // Clear session and redirect to login
          await signOut({ redirect: false })
          router.push('/login')
        } else {
          setError(error)
        }
      }
    }

    fetchData()
  }, [id, router, shopKey, sessionStatus])

  const handleFilterChange = e => {
    const { name, value } = e.target

    if (name === 'start') {
      setFilterStartDate(value)
    } else {
      setFilterEndDate(value)
    }
  }

  const handleButtonClick = columnId => {
    // Toggle the state of clicked button
    setClickedButtons(prevClickedButtons => ({
      ...prevClickedButtons,
      [columnId]: !prevClickedButtons[columnId]
    }))

    // Toggle visibility of column
    handleColumnVisibilityChange(columnId)
  }

  const handleColumnVisibilityChange = columnId => {
    // Toggle visibility of column
    setColumnVisibility(prevColumnVisibility => ({
      ...prevColumnVisibility,
      [columnId]: !prevColumnVisibility[columnId]
    }))
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      sorting // Pass sorting state to the table
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting, // Update sorting state
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const generatePDF = async () => {
    try {
      const container = containerRef.current

      if (!container) {
        throw new Error('Container ref is not set')
      }

      // Hide action buttons temporarily
      const actionButtons = container.querySelector('#ActionsButtons')

      if (actionButtons) {
        actionButtons.style.display = 'none'
      }

      // Capture canvas with html2canvas
      const scale = 2 // Adjust scale as needed for clarity

      const canvas = await html2canvas(container, {
        scale: scale,
        scrollY: -window.scrollY,
        useCORS: true
      })

      // Restore action buttons visibility
      if (actionButtons) {
        actionButtons.style.display = 'flex'
      }

      // Convert canvas to image data
      const imageData = canvas.toDataURL('image/png')

      // Initialize PDF document
      const pdf = new jsPDF('p', 'mm', 'a4')

      // Calculate dimensions and add image to PDF
      const margin = 10
      const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imageData, 'PNG', margin, margin, pdfWidth, pdfHeight)

      // Save PDF with filename
      pdf.save('item-sales.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)

      // Optionally show a user-friendly error message or notification
    }
  }

  // const generatePDF = async () => {
  //   try {
  //     const element = containerRef.current

  //     // Hide action buttons temporarily
  //     const actionButtons = element.querySelector('#ActionsButtons')

  //     if (actionButtons) {
  //       actionButtons.style.display = 'none'
  //     }

  //     // Initialize jsPDF
  //     const pdf = new jsPDF('p', 'mm', 'a4')

  //     // Get the dimensions of the container element
  //     const contentWidth = element.scrollWidth
  //     const contentHeight = element.scrollHeight

  //     // Get the dimensions of the PDF page
  //     const pageWidth = pdf.internal.pageSize.getWidth()
  //     const pageHeight = pdf.internal.pageSize.getHeight()

  //     // Calculate the scale to fit the content on one page
  //     const scaleX = pageWidth / contentWidth
  //     const scaleY = pageHeight / contentHeight
  //     const scale = Math.min(scaleX, scaleY) // Use the smaller scale to fit content

  //     // Convert HTML to PDF with the calculated scale
  //     await pdf.html(element, {
  //       x: 0,
  //       y: 0,
  //       html2canvas: {
  //         scale: scale, // Apply the calculated scale
  //         useCORS: true
  //       },
  //       callback: pdf => {
  //         // Save the PDF
  //         pdf.save('item-sales.pdf')

  //         // Restore action buttons visibility
  //         if (actionButtons) {
  //           actionButtons.style.display = 'flex'
  //         }
  //       },
  //       autoPaging: true
  //     })
  //   } catch (error) {
  //     console.error('Error generating PDF:', error)

  //     // Add specific error handling as needed
  //   }
  // }

  const copyToClipboard = () => {
    let tableData = ''

    table.getRowModel().rows.forEach(row => {
      // Add date range
      tableData += `Date From: ${formatDate(row.original.earliestDate)} To Date: ${formatDate(
        row.original.latestDate
      )}\n`

      // Add descriptions
      tableData += `Major: ${formatValue(row.original.MajorDescription)}\n`
      tableData += `Sub1: ${formatValue(row.original.Sub1Description)}\n`
      tableData += `Sub2: ${formatValue(row.original.Sub2Description)}\n`

      // Add headers for stock data
      tableData +=
        ['Stock Code', 'Description', 'Quantity', 'Cost Price', 'Selling Price', 'GPP', 'GP Value'].join('\t') + '\n'

      // Add stock data rows
      Object.keys(row.original.stockcodes).forEach(stockCodeKey => {
        const stockCodeData = row.original.stockcodes[stockCodeKey]

        tableData +=
          [
            stockCodeData.stockcode,
            stockCodeData.stockdescription,
            formatDecimal(stockCodeData.totalQuantity),
            formatDecimal(stockCodeData.totalCostPrice),
            formatDecimal(stockCodeData.totalSelling),
            formatDecimal(stockCodeData.totalGPP),
            formatDecimal(stockCodeData.totalGpValue)
          ].join('\t') + '\n'
      })

      // Add department totals
      tableData += `Department Totals:\n`
      tableData +=
        [
          '',
          '',
          formatDecimal(row.original.totalQuantity),
          formatDecimal(row.original.totalAverageCostPrice),
          formatDecimal(row.original.totalSelling),
          '',
          formatDecimal(row.original.totalGpValue)
        ].join('\t') + '\n'

      // Add a blank line for spacing
      tableData += '\n'
    })

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(tableData)
        .then(() => {
          console.log('Data copied to clipboard')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
        })
    } else {
      // Fallback for browsers without Clipboard API support
      const textArea = document.createElement('textarea')

      textArea.value = tableData
      document.body.appendChild(textArea)
      textArea.select()

      try {
        document.execCommand('copy')
        console.log('Data copied to clipboard using fallback method')
      } catch (err) {
        console.error('Could not copy text using fallback method: ', err)
      }

      document.body.removeChild(textArea)
    }
  }

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'

    // Loop through each row in the table
    table.getRowModel().rows.forEach(row => {
      // Add date range
      csvContent += `Date From: ${formatDate(row.original.earliestDate)}, To Date: ${formatDate(
        row.original.latestDate
      )}\n`

      // Add descriptions (Major, Sub1, Sub2)
      csvContent += `Major: ${formatValue(row.original.MajorDescription)},`
      csvContent += `Sub1: ${formatValue(row.original.Sub1Description)},`
      csvContent += `Sub2: ${formatValue(row.original.Sub2Description)}\n`

      // Add headers for stock data
      csvContent += `Stock Code,Description,Quantity,Cost Price,Selling Price,GPP,GP Value\n`

      // Loop through each stock code and add its data
      Object.keys(row.original.stockcodes).forEach(stockCodeKey => {
        const stockCodeData = row.original.stockcodes[stockCodeKey]

        csvContent +=
          [
            stockCodeData.stockcode,
            stockCodeData.stockdescription,
            formatDecimal(stockCodeData.totalQuantity),
            formatDecimal(stockCodeData.totalCostPrice),
            formatDecimal(stockCodeData.totalSelling),
            formatDecimal(stockCodeData.totalGPP),
            formatDecimal(stockCodeData.totalGpValue)
          ].join(',') + '\n'
      })

      // Add department totals
      csvContent += `Department Totals:,`
      csvContent += `,,${formatDecimal(row.original.totalQuantity)},`
      csvContent += `${formatDecimal(row.original.totalAverageCostPrice)},`
      csvContent += `${formatDecimal(row.original.totalSelling)},`
      csvContent += `,${formatDecimal(row.original.totalGpValue)}\n\n` // Leave an empty line after each set of data
    })

    // Encode the CSV content and trigger the download
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')

    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'item-sales.csv')
    document.body.appendChild(link) // Required for Firefox

    link.click() // This will download the CSV file
    console.log('Data exported as CSV')
  }

  const exportExcel = () => {
    const XLSX = require('xlsx')

    // Create an array to hold all the data
    const data = []

    // Iterate through each row in the table
    table.getRowModel().rows.forEach(row => {
      // Add date range row
      data.push({
        Date: `Date From: ${formatDate(row.original.earliestDate)} To Date: ${formatDate(row.original.latestDate)}`
      })

      // Add descriptions row
      data.push({
        Major: `Major: ${formatValue(row.original.MajorDescription)}`,
        Sub1: `Sub1: ${formatValue(row.original.Sub1Description)}`,
        Sub2: `Sub2: ${formatValue(row.original.Sub2Description)}`
      })

      // Add headers for stock data
      data.push({
        stockcode: 'Stock Code',
        stockdescription: 'Description',
        totalQuantity: 'Quantity',
        totalCostPrice: 'Cost Price',
        totalSelling: 'Selling Price',
        totalGPP: 'GPP',
        totalGpValue: 'GP Value'
      })

      // Add stock data rows
      Object.keys(row.original.stockcodes).forEach(stockCodeKey => {
        const stockCodeData = row.original.stockcodes[stockCodeKey]

        data.push({
          stockcode: stockCodeData.stockcode,
          stockdescription: stockCodeData.stockdescription,
          totalQuantity: formatDecimal(stockCodeData.totalQuantity),
          totalCostPrice: formatDecimal(stockCodeData.totalCostPrice),
          totalSelling: formatDecimal(stockCodeData.totalSelling),
          totalGPP: formatDecimal(stockCodeData.totalGPP),
          totalGpValue: formatDecimal(stockCodeData.totalGpValue)
        })
      })

      // Add department totals row
      data.push({
        DepartmentTotals: 'Department Totals:',
        totalQuantity: formatDecimal(row.original.totalQuantity),
        totalAverageCostPrice: formatDecimal(row.original.totalAverageCostPrice),
        totalSelling: formatDecimal(row.original.totalSelling),
        totalGpValue: formatDecimal(row.original.totalGpValue)
      })

      // Add an empty row for spacing
      data.push({})
    })

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true })
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Table Data')

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'item-sales.xlsx')
    console.log('Data exported as Excel')
  }

  // const printDocument = () => {
  //   window.print()
  //   console.log('Document printed')
  // }

  const printDocument = () => {
    const printContent = document.getElementById('main')
    const originalContent = document.body.innerHTML

    document.body.innerHTML = printContent.outerHTML

    window.print()

    document.body.innerHTML = originalContent
  }

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }

    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = dateString => {
    const options = { hour: '2-digit', minute: '2-digit' }

    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const formatValue = value => (value ? value : '0')

  const formatDecimal = value => {
    const num = parseFloat(value)

    return !isNaN(num) ? num.toFixed(2) : '0.00'
  }

  return (
    <Card ref={containerRef} id='main'>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-semibold text-primary'>
              <span className=' sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>History Item Sales</span>
            </div>
          }
          className='gap-2 flex-col items-start sm:flex-row sm:items-center text-center'
          titleTypographyProps={{
            style: {
              margin: 0,
              fontFamily: '__Inter_10a487',
              lineHeight: '4.5556',
              color: 'rgb(92 71 129 / 90%)',
              display: 'block'
            }
          }}
          sx={{
            '& .MuiCardHeader-action': { m: 0 }
          }}
        />
      </div>

      <div className='flex m-3'>
        <div className='w-full sm:w-6/12 md:w-8/12 lg:w-9/12 m-3'>
          <h4 className='font-semibold text-left text-lg sm:text-xl md:text-2xl lg:text-3xl' id='CompanyName'>
            {companyDetails?.Company}
          </h4>
          <p className='text-left text-sm sm:text-base md:text-lg lg:text-xl' id='address1'>
            {companyDetails?.Addr1}
          </p>
          <div className='flex flex-col md:flex-row'>
            <div className='w-full md:w-6/12'>
              <p className='text-left text-sm sm:text-base md:text-lg lg:text-xl' id='address2'>
                {companyDetails?.Addr2}
              </p>
              <p className='text-left text-sm sm:text-base md:text-lg lg:text-xl' id='address3'>
                {companyDetails?.Addr3}
              </p>
            </div>
            <div className='w-full md:w-6/12'>
              <div className='flex items-center '>
                <Image src={phone} width='20' height='20' alt='Phone' id='phone' />
                <p className=' text-sm sm:text-base md:text-lg lg:text-xl' id='phone'>
                  {companyDetails?.Phone}
                </p>
              </div>
              <div className='flex items-center '>
                <Image src={email} className='w-5 h-5' alt='Email' id='fax' />
                <p className=' text-sm sm:text-base md:text-lg lg:text-xl' id='fax'>
                  {companyDetails?.Fax}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='p-2'>
        {/* Flex container for inputs */}
        <div className='flex flex-row items-center justify-between mb-4'>
          {/* Start Date section */}
          <div className=' flex-1 text-center mr-2' variant='contained'>
            <label htmlFor='start' className='form-label text-gray-700 font-semibold'>
              <b>Start Date:</b>
            </label>
            <input
              type='date'
              id='start'
              name='start'
              value={filterStartDate}
              onChange={handleFilterChange}
              className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 '
            />
          </div>

          {/* End Date section */}
          <div className='flex-1 text-center '>
            <label htmlFor='end' className='form-label text-gray-700 font-semibold'>
              <b>End Date:</b>
            </label>
            <input
              type='date'
              id='end'
              name='end'
              value={filterEndDate}
              onChange={handleFilterChange}
              className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 '
            />
          </div>
        </div>
      </div>

      <div className='flex justify-center mb-5'>
        <div className='flex flex-wrap items-center justify-center text-sm m-2' id='ActionsButtons'>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={copyToClipboard}
          >
            Copy
          </Button>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={exportCSV}
          >
            CSV
          </Button>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={exportExcel}
          >
            Excel
          </Button>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={generatePDF}
          >
            PDF
          </Button>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={printDocument}
          >
            Print
          </Button>
          <div className='relative inline-block text-center flex-shrink-0 m-1'>
            <button
              type='button'
              className='inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-sm  focus:outline-none bg-purple-600 text-white'
              id='dropdown-menu'
              aria-haspopup='true'
              aria-expanded={showMenu ? 'true' : 'false'}
              onClick={() => setShowMenu(!showMenu)}
              style={{
                backgroundColor: activeColumn ? '#ffffff' : '#8c57ff',
                color: activeColumn ? '#8c57ff' : '#ffffff',
                fontSize: '10px' // Adjust font size for consistency
              }}
            >
              Column visibility
              <svg
                className='-mr-1 ml-2 h-5 w-5'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M9.293 5.293a1 1 0 011.414 0L12 7.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414zM4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
            {showMenu && (
              <div
                className='origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-y-auto'
                style={{ maxHeight: '200px', minWidth: '7rem' }}
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='dropdown-menu'
              >
                <div className='' role='none'>
                  {columns.map(column => (
                    <button
                      key={column.id}
                      onClick={() => handleButtonClick(column.id)}
                      className='block w-full p-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-left'
                      role='menuitem'
                      style={{
                        backgroundColor: clickedButtons[column.id] ? '#ffffff' : '#8c57ff',
                        color: clickedButtons[column.id] ? '#8c57ff' : '#ffffff'
                      }}
                    >
                      {column.header}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div id='tableContainer' className='mb-5 sm:text-sm md:text-base lg:text-lg xl:text-xl'>
        <div className='mb-5'>
          {table &&
            table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                {/* Display earliestDate and latestDate if both are available */}
                {earliestDate && latestDate && (
                  <table className='min-w-full bg-white border border-gray-200 mb-4'>
                    <thead className='bg-gray-100'>
                      <tr>
                        <th
                          colSpan={columns.length}
                          className='border border-gray-200 text-center font-semibold text-gray-700 py-2'
                        >
                          Date From: {formatDate(row.original.earliestDate)} To Date:{' '}
                          {formatDate(row.original.latestDate)}
                        </th>
                      </tr>
                      <tr>
                        <td colSpan={columns.length} className='py-2 p-2'>
                          <div className='flex flex-wrap justify-between '>
                            <h3 className='w-full md:w-auto'>{formatValue(row.original.MajorDescription)}</h3>
                            <h4 className='w-full md:w-auto'>Sub1: {formatValue(row.original.Sub1Description)}</h4>
                            <h4 className='w-full md:w-auto'>Sub2: {formatValue(row.original.Sub2Description)}</h4>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        {table.getHeaderGroups()[0].headers.map(
                          header =>
                            columnVisibility[header.id] && (
                              <th
                                key={header.id}
                                className='border border-gray-200 text-center font-semibold text-gray-700 cursor-pointer'
                                onClick={() => header.column.toggleSorting()} // Correct usage
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted()
                                  ? header.column.getIsSorted() === 'desc'
                                    ? ' 🔽'
                                    : ' 🔼'
                                  : ''}
                              </th>
                            )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(row.original.stockcodes).map(stockCodeKey => {
                        const stockCodeData = row.original.stockcodes[stockCodeKey]

                        return (
                          <tr key={stockCodeKey}>
                            {columns.map(column =>
                              columnVisibility[column.id] ? (
                                <td key={column.id} className='border border-gray-200 text-center'>
                                  {stockCodeData[column.id] || '-'}
                                </td>
                              ) : null
                            )}
                          </tr>
                        )
                      })}
                      <tr>
                        <td colSpan={columns.length} className='bg-gray-50 text-center'>
                          <div className='flex justify-between items-center'>
                            <span className='text-center'>Department Totals:</span>
                            {columns.map(column =>
                              columnVisibility[column.id] ? (
                                <span key={column.id} className='text-center'>
                                  {formatDecimal(row.original[column.id])}
                                </span>
                              ) : null
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </React.Fragment>
            ))}
        </div>
      </div>
      <style jsx>{`
        .origin-top-right {
          scrollbar-width: thin; /* For Firefox */
        }

        /* For WebKit-based browsers (Chrome, Safari) */
        .origin-top-right::-webkit-scrollbar {
          width: 6px;
        }

        .origin-top-right::-webkit-scrollbar-thumb {
          background-color: #a0aec0; /* Color of the scrollbar thumb */
          border-radius: 10px; /* Rounded corners */
        }

        .origin-top-right::-webkit-scrollbar-track {
          background: #f7fafc; /* Color of the scrollbar track */
        }
        @media (min-width: 320px) {
          #tableContainer {
            font-size: 4px; /* Adjust font size for smallest screens */
          }

          #Date {
            font-size: 8px;
          }
          #CompanyName {
            font-size: 1rem;
          }
          #address1,
          #address2,
          #address3,
          #phone,
          #fax {
            font-size: 0.6rem;
          }
        }
        @media (min-width: 640px) {
          #tableContainer {
            font-size: 10px; /* Adjust font size for small screens */
          }
          #Date {
            font-size: 15px;
          }
          #CompanyName {
            font-size: 1.5rem;
          }
          #address1,
          #address2,
          #address3,
          #phone,
          #fax {
            font-size: 0.8rem;
          }
        }
        @media (min-width: 768px) {
          #tableContainer {
            font-size: 10px;
          }
          #Date {
            font-size: 15px;
          }
          #ActionsButtons {
            flex-direction: row;
            gap: 0.5rem;
          }
          #ActionsButtons > * {
            width: auto;
          }
          #CompanyName {
            font-size: 1.5rem;
          }
          #address1,
          #address2,
          #address3,
          #phone,
          #fax {
            font-size: 1rem;
          }
        }
        @media (min-width: 1024px) {
          #tableContainer {
            font-size: 12px; /* Adjust font size for large screens */
          }
          #Date {
            font-size: 20px;
          }
          #CompanyName {
            font-size: 2rem;
          }
          #address1,
          #address2,
          #address3,
          #phone,
          #fax {
            font-size: 1rem;
          }
        }
        @media (min-width: 1280px) {
          #tableContainer {
            font-size: 12px; /* Adjust font size for extra large screens */
          }
          #Date {
            font-size: 20px;
          }
          #CompanyName {
            font-size: 2rem;
          }
          #address1,
          #address2,
          #address3,
          #phone,
          #fax {
            font-size: 1rem;
          }
        }
      `}</style>
    </Card>
  )
}

export default ColumnVisibility
