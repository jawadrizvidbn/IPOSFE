/* eslint-disable react-hooks/rules-of-hooks */
'use client' // Add this line to mark the component as a client component

import React, { useState, useRef, useEffect } from 'react'

import Image from 'next/image'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useSession, signOut } from 'next-auth/react'
import classnames from 'classnames'
import axios from 'axios'

import * as XLSX from 'xlsx'

import styles from '@core/styles/table.module.css'
import email from '../../../public/Assets/email.png'
import phone from '../../../public/Assets/phone.png'

const columnHelper = createColumnHelper()

const saleRepCommissionByProduct_Report = () => {
  const [data, setData] = useState([])

  const [filteredData, setFilteredData] = useState([])
  const [columns, setColumns] = useState([])
  const [companyDetails, setCompanyDetails] = useState({})
  const containerRef = useRef(null)
  const [showMenu, setShowMenu] = useState(false)
  const [activeColumn, setActiveColumn] = useState(null)
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = new URLSearchParams(searchParams).toString()
  const id = new URLSearchParams(searchParams).get('id') // Extracting the id parameter value
  const startDateFromURL = searchParams.get('startDate') || '' // Default to empty if not found
  const endDateFromURL = searchParams.get('endDate') || '' // Default to empty if not found
  const router = useRouter()
  const [clickedButtons, setClickedButtons] = useState({})
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [columnVisibility, setColumnVisibility] = useState({})
  const [grandTotal, setGrandTotal] = useState(null) // State for grand total
  const [sorting, setSorting] = useState([]) // State for sorting
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        if (!session || !session.user || !session.user.token) {
          console.error('Session data not available')

          return
        }

        const token = `Bearer ${session.user.token}`
        const config = { headers: { Authorization: token } }
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/tblReg`

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
  }, [session])

  const fetchData = async () => {
    try {
      if (!session || !session.user || !session.user.token) {
        console.error('Session data not available')

        return
      }

      const token = `Bearer ${session.user.token}` // Ensure this is the correct token
      const config = { headers: { Authorization: token } }
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/saleRepCommissionByProductReport`

      // Payload for the POST request
      const payload = {
        DateFrom: dateFrom,
        DateTo: dateTo
      }

      // Validate API URL
      console.log('API URL:', apiUrl)

      const response = await axios.post(apiUrl, payload, config)
      const responseData = response.data.data || []

      console.log('Fetched Data:', responseData)

      if (Array.isArray(responseData)) {
        setData(responseData) // Directly use the responseData

        console.log('Flattened Data:', responseData)
      } else {
        console.error('Empty or invalid response data')
      }

      const customColumns = [
        columnHelper.accessor('DateTime', {
          id: 'DateTime',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'DateTime',
          enableSorting: true
        }),

        columnHelper.accessor('SaleNum', {
          id: 'SaleNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'SaleNum',
          enableSorting: true
        }),
        columnHelper.accessor('TransactionNum', {
          id: 'TransactionNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'TransactionNum',
          enableSorting: true
        }),
        columnHelper.accessor('StockCode', {
          id: 'StockCode',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'StockCode',
          enableSorting: true
        }),
        columnHelper.accessor('StockDescription', {
          id: 'StockDescription',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'StockDescription',
          enableSorting: true
        }),
        columnHelper.accessor('MajorNo', {
          id: 'MajorNo',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'MajorNo',
          enableSorting: true
        }),
        columnHelper.accessor('Sub1No', {
          id: 'Sub1No',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'Sub1No',
          enableSorting: true
        }),
        columnHelper.accessor('Sub2No', {
          id: 'Sub2No',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'Sub2No',
          enableSorting: true
        }),
        columnHelper.accessor('CreditInvoiceNo', {
          id: 'CreditInvoiceNo',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'CreditInvoiceNo',
          enableSorting: true
        }),
        columnHelper.accessor('UnitVAT', {
          id: 'UnitVAT',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'UnitVAT',
          enableSorting: true
        }),
        columnHelper.accessor('ItemVAT', {
          id: 'ItemVAT',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'ItemVAT',
          enableSorting: true
        }),
        columnHelper.accessor('Qty', {
          id: 'Qty',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'Qty',
          enableSorting: true
        }),

        columnHelper.accessor('StockUnitPrice', {
          id: 'StockUnitPrice',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'StockUnitPrice',
          enableSorting: true
        }),
        columnHelper.accessor('VatPercentage', {
          id: 'VatPercentage',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'VatPercentage',
          enableSorting: true
        }),
        columnHelper.accessor('VatFlag', {
          id: 'VatFlag',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'VatFlag',
          enableSorting: true
        }),
        columnHelper.accessor('PercDiscount', {
          id: 'PercDiscount',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'PercDiscount',
          enableSorting: true
        }),
        columnHelper.accessor('ClerkName', {
          id: 'ClerkName',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'ClerkName',
          enableSorting: true
        }),
        columnHelper.accessor('PaymentType', {
          id: 'PaymentType',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'PaymentType',
          enableSorting: true
        }),
        columnHelper.accessor('ChequeNum', {
          id: 'ChequeNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'ChequeNum',
          enableSorting: true
        }),
        columnHelper.accessor('CardNum', {
          id: 'CardNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'CardNum',
          enableSorting: true
        }),
        columnHelper.accessor('AccountNum', {
          id: 'AccountNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'AccountNum',
          enableSorting: true
        }),
        columnHelper.accessor('Carwash', {
          id: 'Carwash',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'Carwash',
          enableSorting: true
        }),
        columnHelper.accessor('ExternalOrderNum', {
          id: 'ExternalOrderNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'ExternalOrderNum',
          enableSorting: true
        }),
        columnHelper.accessor('SerialItem', {
          id: 'SerialItem',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'SerialItem',
          enableSorting: true
        }),
        columnHelper.accessor('ComputerName', {
          id: 'ComputerName',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'ComputerName',
          enableSorting: true
        }),
        columnHelper.accessor('SerialNum', {
          id: 'SerialNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'SerialNum',
          enableSorting: true
        }),
        columnHelper.accessor('AverageCostPrice', {
          id: 'AverageCostPrice',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'AverageCostPrice',
          enableSorting: true
        }),
        columnHelper.accessor('LastCostPrice', {
          id: 'LastCostPrice',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'LastCostPrice',
          enableSorting: true
        }),
        columnHelper.accessor('LineTotal', {
          id: 'LineTotal',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'LineTotal',
          enableSorting: true
        }),
        columnHelper.accessor('InvoiceTotal', {
          id: 'InvoiceTotal',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'InvoiceTotal',
          enableSorting: true
        }),
        columnHelper.accessor('PickingSlip', {
          id: 'PickingSlip',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'PickingSlip',
          enableSorting: true
        }),
        columnHelper.accessor('AccInvoiceNum', {
          id: 'AccInvoiceNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'AccInvoiceNum',
          enableSorting: true
        }),
        columnHelper.accessor('Comment', {
          id: 'Comment',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'Comment',
          enableSorting: true
        }),
        columnHelper.accessor('CashupNum', {
          id: 'CashupNum',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'CashupNum',
          enableSorting: true
        }),
        columnHelper.accessor('InCashUp', {
          id: 'InCashUp',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'InCashUp',
          enableSorting: true
        }),
        columnHelper.accessor('PosSale', {
          id: 'PosSale',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'PosSale',
          enableSorting: true
        }),
        columnHelper.accessor('Transfer', {
          id: 'Transfer',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'Transfer',
          enableSorting: true
        }),
        columnHelper.accessor('Tendered', {
          id: 'Tendered',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'Tendered',
          enableSorting: true
        }),
        columnHelper.accessor('hisYear', {
          id: 'hisYear',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'hisYear',
          enableSorting: true
        }),
        columnHelper.accessor('hisMonth', {
          id: 'hisMonth',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'hisMonth',
          enableSorting: true
        }),
        columnHelper.accessor('hisday', {
          id: 'hisday',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'hisday',
          enableSorting: true
        }),
        columnHelper.accessor('sliptype', {
          id: 'sliptype',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'sliptype',
          enableSorting: true
        }),
        columnHelper.accessor('ClerkCashup', {
          id: 'ClerkCashup',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'ClerkCashup',
          enableSorting: true
        }),
        columnHelper.accessor('SalesRepCode', {
          id: 'SalesRepCode',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'SalesRepCode',
          enableSorting: true
        }),
        columnHelper.accessor('SalesRepName', {
          id: 'SalesRepName',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'SalesRepName',
          enableSorting: true
        })
      ]

      setColumns(customColumns)

      const visibility = {}
      const clickedState = {}

      const defaultVisibleColumns = [
        'DateTime',
        'SaleNum',

        // 'TransactionNum',
        // "StockCode",
        'StockDescription',
        'MajorNo',
        'Sub1No',
        'Sub2No',

        // "CreditInvoiceNo",
        'UnitVAT',

        // "ItemVAT",
        'Qty',

        'StockUnitPrice',
        'VatPercentage',
        'VatFlag',
        'PercDiscount',
        'ClerkName',
        'PaymentType',
        'ChequeNum',

        // 'CardNum',
        // 'AccountNum',
        // 'Carwash',
        // 'ExternalOrderNum',
        // 'SerialItem',
        // 'ComputerName',
        // 'SerialNum',
        // 'AverageCostPrice',
        // 'LastCostPrice',
        // 'LineTotal',
        // 'InvoiceTotal',
        // 'PickingSlip',
        // 'Comment',
        // 'CashupNum',
        // 'InCashUp',
        // 'PosSale',
        'Transfer'

        // 'Tendered',
        // 'hisYear',
        // 'hisMonth',
        // 'hisday',
        // 'sliptype',
        // 'SalesRepCode',
        // 'SalesRepName'
      ]

      customColumns.forEach(column => {
        visibility[column.id] = defaultVisibleColumns.includes(column.id)
        clickedState[column.id] = defaultVisibleColumns.includes(column.id)
      })

      setColumnVisibility(visibility)
      setClickedButtons(clickedState)
    } catch (error) {
      console.error('Error fetching or setting sales data:', error)

      if (error.response && error.response.status === 401) {
        await signOut({ redirect: false })
        router.push('/login')
      }
    }
  }

  // Filter data based on search term
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()

    const newData = data.filter(item => {
      return Object.values(item).some(value => String(value).toLowerCase().includes(lowercasedSearchTerm))
    })

    setFilteredData(newData)
  }, [searchTerm, data])

  const handleFilterChange = e => {
    const { name, value } = e.target

    if (name === 'start') {
      setFilterStartDate(value)
    } else {
      setFilterEndDate(value)
    }
  }

  const handleButtonClick = columnId => {
    setClickedButtons(prevClickedButtons => ({
      ...prevClickedButtons,
      [columnId]: !prevClickedButtons[columnId]
    }))
    handleColumnVisibilityChange(columnId)
  }

  const handleColumnVisibilityChange = columnId => {
    setColumnVisibility(prevColumnVisibility => ({
      ...prevColumnVisibility,
      [columnId]: !prevColumnVisibility[columnId]
    }))
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnVisibility,
      sorting
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting
  })

  const copyToClipboard = () => {
    const table = document.querySelector('#tableContainer table')
    let tsv = ''

    // Get column visibility information from your table (adapt as needed)
    const columnVisibility = Array.from(table.querySelectorAll('th')).map(th => {
      return !th.classList.contains('hidden') // Adapt this based on how you're handling visibility
    })

    // Iterate over table rows
    for (let row of table.rows) {
      const cells = Array.from(row.cells)
        .map((cell, index) => {
          // Check if the column is visible
          if (columnVisibility[index]) {
            // Replace tabs and newlines with spaces to avoid breaking the TSV format
            const content = cell.textContent ? cell.textContent.replace(/\t/g, ' ').replace(/\n/g, ' ') : ''

            // Escape double quotes within the content
            return `"${content.replace(/"/g, '""')}"`
          }

          return '' // Empty string for hidden columns
        })
        .filter(cell => cell !== '') // Remove empty cells (hidden columns)
        .join('\t')

      // Append row data with tab-separated values and add a newline
      tsv += cells + '\n'
    }

    // Copy the formatted TSV data to clipboard
    navigator.clipboard.writeText(tsv).catch(err => {
      console.error('Failed to copy data: ', err)
    })
  }

  const exportCSV = () => {
    const table = document.querySelector('#tableContainer table')
    let csv = ''

    for (let row of table.rows) {
      const cells = Array.from(row.cells)
        .map(cell => `"${cell.textContent.replace(/"/g, '""')}"`)
        .join(',')

      csv += cells + '\n'
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    link.href = URL.createObjectURL(blob)
    link.download = 'Price-Change-Report.csv'
    link.click()
  }

  const exportExcel = () => {
    const table = document.querySelector('#tableContainer table')
    const ws = XLSX.utils.table_to_sheet(table)
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    XLSX.writeFile(wb, 'Price-Change-Report.xlsx')
  }

  const printDocument = () => {
    const printContent = document.getElementById('main')
    const originalContent = document.body.innerHTML

    document.body.innerHTML = printContent.outerHTML

    window.print()

    document.body.innerHTML = originalContent
  }

  // const printDocument = () => {
  //   const table = document.querySelector('#main').innerHTML;
  //   const printWindow = window.open('', '', 'height=600,width=800');

  //   printWindow.document.write('<html><head><title>Print</title></head><body>');
  //   printWindow.document.write(table);
  //   printWindow.document.write('</body></html>');
  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();
  // };

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
      pdf.save('Price-Change-Report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)

      // Optionally show a user-friendly error message or notification
    }
  }

  return (
    <Card ref={containerRef} id='main'>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-semibold text-primary'>
              <span className='sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>
                Sale Rep Commission By Product Report{' '}
              </span>
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
      {/* Date Inputs and Submit Button */}
      <div className='flex justify-center space-x-4 mb-4'>
        <div>
          <label htmlFor='dateFrom' className='block mb-2 font-medium text-gray-700'>
            Date From:
          </label>
          <input
            type='date'
            id='dateFrom'
            className='border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm'
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor='dateTo' className='block mb-2 font-medium text-gray-700'>
            Date To:
          </label>
          <input
            type='date'
            id='dateTo'
            className='border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm'
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
        <div className='flex items-end'>
          <button
            className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
            onClick={fetchData}
          >
            Submit
          </button>
        </div>
      </div>
      <div className='flex justify-center mb-5'>
        <div className='flex flex-wrap items-center justify-center text-sm m-2' id='ActionsButtons'>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={copyToClipboard} // Set the copyToClipboard function
          >
            Copy
          </Button>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={exportCSV} // Set the exportCSV function
          >
            CSV
          </Button>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={exportExcel} // Set the exportExcel function
          >
            Excel
          </Button>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={generatePDF} // Assuming you already have the generatePDF function
          >
            PDF
          </Button>
          <Button
            className='flex-shrink-0 btn btn-secondary m-1'
            style={{ fontSize: '14px' }}
            variant='contained'
            onClick={printDocument} // Set the printDocument function
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
                className='-mr-1  h-5 w-5'
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

      <div id='tableContainer' className='sm:text-sm md:text-base lg:text-lg xl:text-xl' ref={containerRef}>
        <div className=''>
          <table className='min-w-full bg-white border border-gray-200'>
            <thead className='bg-gray-100'>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='cursor-pointer' onClick={header.column.getToggleSortingHandler()}>
                      <div
                        className='border border-gray-200 text-center font-semibold text-gray-700 flex items-center justify-center'
                        id='Header'
                      >
                        {header.isPlaceholder ? null : (
                          <>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽') : ''}
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className='p-1 border border-gray-200 text-center'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>{`
        .origin-top-right {
          scrollbar-width: thin; /* For Firefox */
        }
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
            font-size: 0.4rem;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
          }
          table {
            table-layout: fixed;
            width: 100%;
            border-collapse: collapse;
          }
          th {
            padding: 0.1rem;
            border: 0.1rem solid #ccc;
            box-sizing: border-box;
            font-size: 0.4rem;
          }
          td {
            padding: 0.1rem;
            border: 0.1rem solid #ccc;
            box-sizing: border-box;
            word-wrap: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          #datetime {
            font-size: 0.6rem;
          }
          #Header {
            font-size: 0.4rem;
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
            font-size: 10px;
          }
          #datetime {
            font-size: 15px;
          }
          #Header {
            font-size: 0.4rem;
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
          #datetime {
            font-size: 15px;
          }
          #ActionsButtons {
            flex-direction: row;
            gap: 0.5rem;
          }
          #ActionsButtons > * {
            width: auto;
          }
          #Header {
            font-size: 0.5rem;
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
            font-size: 12px;
          }
          #datetime {
            font-size: 20px;
          }
          #Header {
            font-size: 0.6rem;
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
            font-size: 12px;
          }
          #datetime {
            font-size: 20px;
          }
          #Header {
            font-size: 0.6rem;
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

export default saleRepCommissionByProduct_Report
