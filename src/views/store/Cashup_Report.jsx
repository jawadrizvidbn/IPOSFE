'use client'

import React, { useState, useRef, useEffect } from 'react'

import Image from 'next/image'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

import { useSession, signOut } from 'next-auth/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import axios from 'axios'
import classnames from 'classnames'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'

import * as XLSX from 'xlsx'

import styles from '@core/styles/table.module.css'
import email from '../../../public/Assets/email.png'
import phone from '../../../public/Assets/phone.png'

const columnHelper = createColumnHelper()

const ColumnVisibility = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [columns, setColumns] = useState([])
  const [companyDetails, setCompanyDetails] = useState({})
  const [showMenu, setShowMenu] = useState(false)
  const [activeColumn, setActiveColumn] = useState(null)
  const [clickedButtons, setClickedButtons] = useState({})
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [columnVisibility, setColumnVisibility] = useState({})
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = new URLSearchParams(searchParams).toString()
  const id = new URLSearchParams(searchParams).get('id') // Extracting the id parameter value
  const startDateFromURL = searchParams.get('startDate') || '' // Default to empty if not found
  const endDateFromURL = searchParams.get('endDate') || '' // Default to empty if not found
  const router = useRouter()
  const containerRef = useRef(null)
  const [grandTotals, setGrandTotals] = useState({})
  const [sorting, setSorting] = useState([]) // State for sorting
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
      if (!session || !session.user || !session.user.token) return

      try {
        const token = `Bearer ${session.user.token}`
        const config = { headers: { Authorization: token } }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/database/tblReg?shopKey=${shopKey}`,
          config
        )

        if (response.data?.length) setCompanyDetails(response.data[0])
      } catch (error) {
        console.error('Error fetching company data:', error)
      }
    }

    fetchCompanyDetails()
  }, [session?.token?.user, shopKey])

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        console.error('Session data not available')

        return
      }

      try {
        const token = `Bearer ${session.user.token}`
        const config = { headers: { Authorization: token } }
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/currentCashupReport/${id}?shopKey=${shopKey}`

        const response = await axios.get(apiUrl, config)
        const responseGrandTotals = response.data?.grandTotals || null

        if (Array.isArray(response.data.data)) {
          setData(response.data.data)
        } else {
          console.error('Empty or invalid response data')
        }

        console.log('Tufail', response.data.data)

        setGrandTotals(responseGrandTotals)

        const customColumns = [
          columnHelper.accessor('cashupnum', {
            id: 'cashupnum',
            header: 'Cashup No',
            enableSorting: true,
            cell: info => info.getValue()
          }),
          columnHelper.accessor('entitydesc', {
            id: 'entitydesc',
            header: 'Cashier',
            enableSorting: true,
            cell: info => info.getValue()
          }),
          columnHelper.accessor('salescash', {
            id: 'salescash',
            header: 'Cash Sales',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('salescard', {
            id: 'salescard',
            header: 'Card Sales',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('salescheque', {
            id: 'salescheque',
            header: 'Cheque Sales',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('salesaccount', {
            id: 'salesaccount',
            header: 'Account Sales',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('ddeposit', {
            id: 'ddeposit',
            header: 'Direct Deposit',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('totalsales', {
            id: 'totalsales',
            header: 'Total Sales',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('payout', {
            id: 'payout',
            header: 'Payout',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('refunds', {
            id: 'refunds',
            header: 'Refunds',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('cashout', {
            id: 'cashout',
            header: 'Cashout',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('paytotal', {
            id: 'paytotal',
            header: 'Payments',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('net_declared', {
            id: 'net_declared',
            header: 'Declared',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('discrepancy', {
            id: 'discrepancy',
            header: 'Difference',
            enableSorting: true,
            cell: info => (info.getValue() != null ? info.getValue().toFixed(2) : '0.00')
          }),
          columnHelper.accessor('formattedDate', {
            id: 'formattedDate',
            header: 'Date',
            enableSorting: true,
            cell: info => new Date(info.getValue()).toLocaleDateString()
          })
        ]

        setColumns(customColumns)

        const visibility = {}
        const clickedState = {}
        const defaultVisibleColumns = ['formattedDate', 'cashupnum', 'salescash', 'salescard', 'totalsales', 'payout']

        customColumns.forEach(column => {
          visibility[column.id] = defaultVisibleColumns.includes(column.id)
          clickedState[column.id] = defaultVisibleColumns.includes(column.id)
        })

        setColumnVisibility(visibility)
        setClickedButtons(clickedState)
      } catch (error) {
        console.error('Error fetching or setting sales data:', error)

        if (error.response?.status === 401) {
          await signOut({ redirect: false })
          router.push('/login')
        }
      }
    }

    fetchData()
  }, [session?.user?.token, shopKey, id, router])

  useEffect(() => {
    const filtered = data?.filter(item => {
      const itemDate = new Date(item.formattedDate)
      const startDate = new Date(filterStartDate)
      const endDate = new Date(filterEndDate)

      endDate.setHours(23, 59, 59, 999)

      // // Move the console.log statement here
      // console.log('DateTufail', itemDate)

      return (!filterStartDate || itemDate >= startDate) && (!filterEndDate || itemDate <= endDate)
    })

    setFilteredData(filtered)
  }, [filterStartDate, filterEndDate, data])

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
      sorting // Ensure sorting state is passed
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting, // Ensure this is updating the sorting state
    getSortedRowModel: getSortedRowModel() // Include this for sorting
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

    // Try using the Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tsv).catch(err => {
        console.error('Failed to copy data using Clipboard API: ', err)
        fallbackCopyToClipboard(tsv)
      })
    } else {
      // Fallback to using execCommand if Clipboard API is not available
      fallbackCopyToClipboard(tsv)
    }
  }

  // Fallback method using document.execCommand
  const fallbackCopyToClipboard = text => {
    const textArea = document.createElement('textarea')

    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()

    try {
      document.execCommand('copy')
      console.log('Data copied to clipboard using fallback method')
    } catch (err) {
      console.error('Failed to copy data using fallback method: ', err)
    }

    document.body.removeChild(textArea)
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
    link.download = 'cashup-sales.csv'
    link.click()
  }

  const exportExcel = () => {
    const table = document.querySelector('#tableContainer table')
    const ws = XLSX.utils.table_to_sheet(table)
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    XLSX.writeFile(wb, 'cashup-sales.xlsx')
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
      pdf.save('cashup-sales.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)

      // Optionally show a user-friendly error message or notification
    }
  }

  const formatDate = dateString => {
    // Ensure dateString is a valid date format
    const date = new Date(dateString)

    return date.toLocaleDateString() // Format the date as desired
  }

  return (
    <Card ref={containerRef} id='main'>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-semibold text-primary'>
              <span className=' sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>Cashup Sales</span>
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

      <div className='flex justify-center'>
        <div className='flex flex-col sm:flex-row sm:space-x-4 mb-3'>
          <div className='mb-2 sm:mb-0'>
            <p className='text-center sm:text-left text-base sm:text-lg' id='Date'>
              <b>Date From: </b>
              {data?.length > 0 && <span className='ml-1'>{formatDate(data[0].formattedDate)}</span>}
            </p>
          </div>
          <div className='mb-2 sm:mb-0'>
            <p className='text-center sm:text-left text-base sm:text-lg' id='Date'>
              <b>To Date: </b>
              {data?.length > 0 && <span className='ml-1'>{formatDate(data[data.length - 1].formattedDate)}</span>}
            </p>
          </div>
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
              {table?.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className='cursor-pointer'
                      onClick={header.column.getToggleSortingHandler()} // Ensure this is bound correctly
                    >
                      <div
                        className='border border-gray-200 text-center font-semibold text-gray-700 flex items-center justify-center'
                        id='Header'
                      >
                        {header.isPlaceholder ? null : (
                          <>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {
                              header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽') : '' // No sorting indicator when not sorted
                            }
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table?.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className='p-1 border border-gray-200 text-center'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Total row */}
              {grandTotals && (
                <tr>
                  {columns.map(column => {
                    const isVisible = columnVisibility[column.id]

                    return (
                      isVisible && (
                        <td key={column.id} className='p-1 border border-gray-200 text-center'>
                          {column.id === 'cashupnum' && <strong>Reports Total:</strong>}
                          {grandTotals[column.id] !== undefined &&
                            (column.cell
                              ? column.cell({ getValue: () => grandTotals[column.id] })
                              : grandTotals[column.id])}
                        </td>
                      )
                    )
                  })}
                </tr>
              )}
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
          #Date {
            font-size: 0.5rem;
          }
          #Header {
            font-size: 0.2rem;
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
          #Date {
            font-size: 15px;
          }
          #Header {
            font-size: 0.2rem;
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
          #Date {
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
          #Date {
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

export default ColumnVisibility

// 'use client' // Add this line to mark the component as a client component

// import React, { useState, useRef, useEffect } from 'react'

// import Image from 'next/image'
// import { usePathname, useSearchParams, useRouter } from 'next/navigation'

// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import Button from '@mui/material/Button'
// import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
// import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas'
// import { useSession, signOut } from 'next-auth/react'
// import classnames from 'classnames'
// import axios from 'axios'

// import styles from '@core/styles/table.module.css'
// import email from '../../../public/Assets/email.png'
// import phone from '../../../public/Assets/phone.png'

// const columnHelper = createColumnHelper()

// const ColumnVisibility = () => {
//   const [data, setData] = useState([])
//   const [totalsData, setOverallTotals] = useState()
//   const [totalCash, setTotalCash] = useState()
//   const [totalCard, setTotalCard] = useState()
//   const [filteredData, setFilteredData] = useState([])
//   const [columns, setColumns] = useState([])
//   const [companyDetails, setCompanyDetails] = useState({})
//   const containerRef = useRef(null)
//   const [showMenu, setShowMenu] = useState(false)
//   const [activeColumn, setActiveColumn] = useState(null)
//   const { data: session } = useSession()
//   const pathname = usePathname()
//   const searchParams = useSearchParams()
//   const queryString = new URLSearchParams(searchParams).toString()
//   const id = new URLSearchParams(searchParams).get('id') // Extracting the id parameter value
//   const router = useRouter()
//   const [clickedButtons, setClickedButtons] = useState({})
//   const [filterStartDate, setFilterStartDate] = useState('')
//   const [filterEndDate, setFilterEndDate] = useState('')
//   const [columnVisibility, setColumnVisibility] = useState({})

//   useEffect(() => {
//     const fetchCompanyDetails = async () => {
//       try {
//         if (!session || !session.user || !session.user.token) {
//           console.error('Session data not available')

//           return
//         }

//         const token = `Bearer ${session.user.token}`
//         const config = { headers: { Authorization: token } }
//         const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/tblReg`

//         const response = await axios.get(apiUrl, config)

//         if (Array.isArray(response.data) && response.data.length > 0) {
//           setCompanyDetails(response.data[0])
//         } else {
//           console.error('Empty or invalid response data')
//         }
//       } catch (error) {
//         console.error('Error fetching company data:', error)
//       }
//     }

//     fetchCompanyDetails()
//   }, [session])

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!session?.user?.id) {
//           console.error('Session data not available');
//           return;
//         }

//         const token = `Bearer ${session.user.token}`;
//         const config = { headers: { Authorization: token } };
//         const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/TblDataCashupDet/${id}`;

//         const response = await axios.get(apiUrl, config);
//         console.log("Response:", response);

//         if (Array.isArray(response.data) && response.data.length > 0) {
//           // Directly use the response data as it's already an array of objects
//           const newDailyData = response.data;

//           // Set the new state with the aggregated data
//           setData(newDailyData);
//           console.log("Processed Data:", newDailyData);

//           // Define columns based on the data structure
//           const customColumns = [
//             columnHelper.accessor('cashupnum', {
//               header: 'Cashup No',
//               cell: info => info.getValue() ?? 'N/A' // Provide default value if undefined
//             }),
//             columnHelper.accessor('date', {
//               header: 'Date',
//               cell: info => {
//                 const value = info.getValue();
//                 return value ? new Date(value).toLocaleDateString() : 'N/A'; // Handle undefined date
//               }
//             }),
//             columnHelper.accessor('salescash', {
//               header: 'Cash Sales',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('salescard', {
//               header: 'Card Sales',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('salescheque', {
//               header: 'Cheque Sales',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('salesaccount', {
//               header: 'Account Sales',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('ddeposit', {
//               header: 'Direct Deposit',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('totalsales', {
//               header: 'Total Sales',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('payout', {
//               header: 'Payout',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('refunds', {
//               header: 'Refunds',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('cashout', {
//               header: 'Cashout',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('payments', {
//               header: 'Payments',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('declared', {
//               header: 'Declared',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             }),
//             columnHelper.accessor('difference', {
//               header: 'Difference',
//               cell: info => {
//                 const value = info.getValue();
//                 return value !== undefined && value !== null ? value.toFixed(2) : '0.00'; // Safe toFixed
//               }
//             })
//           ];

//           setColumns(customColumns);

//           const visibility = {};
//           const clickedState = {};

//           const defaultVisibleColumns = ['cashupnum', 'salescash', 'salescard', 'totalsales', 'payout'];

//           customColumns.forEach(column => {
//             visibility[column.id] = defaultVisibleColumns.includes(column.id);
//             clickedState[column.id] = defaultVisibleColumns.includes(column.id);
//           });

//           setColumnVisibility(visibility);
//           setClickedButtons(clickedState);
//         } else {
//           console.error('Empty or invalid response data');
//         }
//       } catch (error) {
//         console.error('Error fetching or setting sales data:', error);

//         if (error.response?.status === 401) {
//           await signOut({ redirect: false });
//           router.push('/login');
//         }
//       }
//     };

//     fetchData();
//   }, [session, id]);

//   useEffect(() => {
//     const filtered = data?.filter(item => {
//       const itemDate = new Date(item.date)
//       const startDate = new Date(filterStartDate)
//       const endDate = new Date(filterEndDate)

//       return (!filterStartDate || itemDate >= startDate) && (!filterEndDate || itemDate <= endDate)
//     })

//     setFilteredData(filtered)
//   }, [filterStartDate, filterEndDate, data])

//   const handleFilterChange = e => {
//     const { name, value } = e.target

//     if (name === 'start') {
//       setFilterStartDate(value)
//     } else {
//       setFilterEndDate(value)
//     }
//   }

//   const handleButtonClick = columnId => {
//     setClickedButtons(prevClickedButtons => ({
//       ...prevClickedButtons,
//       [columnId]: !prevClickedButtons[columnId]
//     }))
//     handleColumnVisibilityChange(columnId)
//   }

//   const handleColumnVisibilityChange = columnId => {
//     setColumnVisibility(prevColumnVisibility => ({
//       ...prevColumnVisibility,
//       [columnId]: !prevColumnVisibility[columnId]
//     }))
//   }

//   const table = useReactTable({
//     data: filteredData,
//     columns,
//     state: {
//       columnVisibility
//     },
//     onColumnVisibilityChange: setColumnVisibility,
//     getCoreRowModel: getCoreRowModel()
//   })

//   const generatePDF = async () => {
//     try {
//       const container = containerRef.current

//       // Hide action buttons temporarily
//       const actionButtons = container.querySelector('#ActionsButtons')

//       actionButtons.style.display = 'none'

//       // Capture canvas with html2canvas
//       const scale = 2 // Adjust scale as needed for clarity

//       const canvas = await html2canvas(container, {
//         scale: scale,
//         scrollY: -window.scrollY,
//         useCORS: true
//       })

//       // Restore action buttons visibility
//       actionButtons.style.display = 'flex'

//       // Convert canvas to image data
//       const imageData = canvas.toDataURL('image/png')

//       // Initialize PDF document
//       const pdf = new jsPDF('p', 'mm', 'a4')

//       // Calculate dimensions and add image to PDF
//       const margin = 10
//       const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width

//       pdf.addImage(imageData, 'PNG', margin, margin, pdfWidth, pdfHeight)

//       // Save PDF with filename
//       pdf.save('cashup-sales.pdf')
//     } catch (error) {
//       console.error('Error generating PDF:', error)

//       // Add specific error handling as needed
//     }
//   }

//   const formatDate = date => {
//     const options = { day: '2-digit', month: '2-digit', year: 'numeric' }

//     return date.toLocaleDateString(undefined, options)
//   }

//   return (
//     <Card ref={containerRef}>
//       <div className='flex justify-center'>
//         <CardHeader
//           title={
//             <div className='font-semibold text-primary'>
//               <span className='text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>History Daily Sales</span>
//             </div>
//           }
//           className='gap-2 flex-col items-start sm:flex-row sm:items-center text-center'
//           titleTypographyProps={{
//             style: {
//               margin: 0,
//               fontFamily: '__Inter_10a487',
//               lineHeight: '4.5556',
//               color: 'rgb(92 71 129 / 90%)',
//               display: 'block'
//             }
//           }}
//           sx={{
//             '& .MuiCardHeader-action': { m: 0 }
//           }}
//         />
//       </div>
//       <div className='flex m-5'>
//         <div className='w-full sm:w-6/12 md:w-8/12 lg:w-9/12 m-3 '>
//           <h4 className='font-semibold text-left text-lg sm:text-xl md:text-2xl lg:text-3xl'>
//             {companyDetails?.Company}
//           </h4>
//           <p className='text-left text-sm sm:text-base md:text-lg lg:text-xl'>{companyDetails?.Addr1}</p>
//           <div className='flex flex-col md:flex-row'>
//             <div className='md:w-6/12'>
//               <p className='text-left text-sm sm:text-base md:text-lg lg:text-xl'>{companyDetails?.Addr2}</p>
//               <p className='text-left text-sm sm:text-base md:text-lg lg:text-xl'>{companyDetails?.Addr3}</p>
//             </div>
//             <div className='md:w-6/12'>
//               <div className='flex items-center my-2'>
//                 <Image src={phone} width='20' height='20' alt='Phone' />
//                 <p className='ml-2 text-sm sm:text-base md:text-lg lg:text-xl'>{companyDetails?.Phone}</p>
//               </div>
//               <div className='flex items-center my-2'>
//                 <Image src={email} className='w-5 h-5' alt='Email' />
//                 <p className='ml-2 text-sm sm:text-base md:text-lg lg:text-xl'>{companyDetails?.Fax}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className='p-6'>
//         {/* Flex container for inputs */}
//         <div className='flex flex-col md:flex-row items-center md:justify-between mb-4'>
//           {/* Start Date section */}
//           <div className='mb-2 md:mb-0 flex-1 md:text-center md:mr-2' variant='contained'>
//             {' '}
//             {/* Increased space between elements */}
//             <label htmlFor='start' className='form-label text-gray-700 font-semibold'>
//               {' '}
//               {/* Styled label */}
//               <b>Start Date:</b>
//             </label>
//             <input
//               type='date'
//               id='start'
//               name='start'
//               value={filterStartDate}
//               onChange={handleFilterChange}
//               className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ml-2' // Enhanced input styling
//             />
//           </div>
//           <div className='flex-1 md:text-center md:ml-2'>
//             <label htmlFor='end' className='form-label text-gray-700 font-semibold'>
//               <b>End Date:</b>
//             </label>
//             <input
//               type='date'
//               id='end'
//               name='end'
//               value={filterEndDate}
//               onChange={handleFilterChange}
//               className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ml-2' // Enhanced input styling
//             />
//           </div>
//         </div>
//       </div>

//       <div className='flex justify-center'>
//         <div className='flex flex-col sm:flex-row sm:space-x-4 mb-3'>
//           <div className='mb-2 sm:mb-0'>
//             <p className='text-center sm:text-left text-base sm:text-lg' id='Date'>
//               <b>Date From: </b>
//               {data?.length > 0 && <span className='ml-1'>{data[0].date}</span>}
//             </p>
//           </div>
//           <div className='mb-2 sm:mb-0'>
//             <p className='text-center sm:text-left text-base sm:text-lg' id='Date'>
//               <b>To Date: </b>
//               {data?.length > 0 && <span className='ml-1'>{data[data.length - 1].date}</span>}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className='flex justify-center mb-5'>
//         <div className='flex flex-wrap items-center justify-center text-sm m-2' id='ActionsButtons'>
//           <Button className='flex-shrink-0 btn btn-secondary m-1' style={{ fontSize: '14px' }} variant='contained'>
//             Copy
//           </Button>
//           <Button className='flex-shrink-0 btn btn-secondary m-1' style={{ fontSize: '14px' }} variant='contained'>
//             CSV
//           </Button>
//           <Button className='flex-shrink-0 btn btn-secondary m-1' style={{ fontSize: '14px' }} variant='contained'>
//             Excel
//           </Button>
//           <Button
//             className='flex-shrink-0 btn btn-secondary m-1'
//             style={{ fontSize: '14px' }}
//             variant='contained'
//             onClick={generatePDF}
//           >
//             PDF
//           </Button>
//           <Button className='flex-shrink-0 btn btn-secondary m-1' style={{ fontSize: '14px' }} variant='contained'>
//             Print
//           </Button>
//           <div className='relative inline-block text-center flex-shrink-0 m-1'>
//             <button
//               type='button'
//               className='inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-sm  focus:outline-none bg-purple-600 text-white'
//               id='dropdown-menu'
//               aria-haspopup='true'
//               aria-expanded={showMenu ? 'true' : 'false'}
//               onClick={() => setShowMenu(!showMenu)}
//               style={{
//                 backgroundColor: activeColumn ? '#ffffff' : '#8c57ff',
//                 color: activeColumn ? '#8c57ff' : '#ffffff',
//                 fontSize: '10px' // Adjust font size for consistency
//               }}
//             >
//               Column visibility
//               <svg
//                 className='-mr-1 ml-2 h-5 w-5'
//                 xmlns='http://www.w3.org/2000/svg'
//                 viewBox='0 0 20 20'
//                 fill='currentColor'
//                 aria-hidden='true'
//               >
//                 <path
//                   fillRule='evenodd'
//                   d='M9.293 5.293a1 1 0 011.414 0L12 7.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414zM4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z'
//                   clipRule='evenodd'
//                 />
//               </svg>
//             </button>
//             {showMenu && (
//               <div
//                 className='origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-y-auto'
//                 style={{ maxHeight: '200px', minWidth: '7rem' }}
//                 role='menu'
//                 aria-orientation='vertical'
//                 aria-labelledby='dropdown-menu'
//               >
//                 <div className='' role='none'>
//                   {columns.map(column => (
//                     <button
//                       key={column.id}
//                       onClick={() => handleButtonClick(column.id)}
//                       className='block w-full p-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-left'
//                       role='menuitem'
//                       style={{
//                         backgroundColor: clickedButtons[column.id] ? '#ffffff' : '#8c57ff',
//                         color: clickedButtons[column.id] ? '#8c57ff' : '#ffffff'
//                       }}
//                     >
//                       {column.header}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div id='tableContainer' className='p-5 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl' ref={containerRef}>
//         <div className=''>
//           <table className='min-w-full bg-white border border-gray-200'>
//             <thead className='bg-gray-100'>
//               {table?.getHeaderGroups().map(headerGroup => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map(header => (
//                     <th key={header.id} className=''>
//                       <div className='border border-gray-200  text-center font-semibold text-gray-700'>
//                         {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody>
//               {/* Render rows */}
//               {table.getRowModel().rows.map(row => (
//                 <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
//                   {row.getVisibleCells().map(cell => (
//                     <td key={cell.id} className='p-1 border border-gray-200 text-center'>
//                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                     </td>
//                   ))}
//                 </tr>
//               ))}

//               {/* Total row */}
//               <tr>
//                 {columns.map((column, index) => {
//                   // Check visibility of each column
//                   const isVisible = columnVisibility[column.id] // Assuming columnVisibility contains visibility information

//                   return (
//                     isVisible && (
//                       <td key={index} className='p-1 border border-gray-200 text-center'>
//                         {column.id === 'date' && <strong>Total: </strong>}
//                         {column.id === 'totalInclSelling' && (totalsData?.totalInclSelling?.toFixed(2) || '0.00')}
//                         {column.id === 'dayProfit' && (totalsData?.dayProfit?.toFixed(2) || '0.00')}
//                         {column.id === 'totalExclSelling' && (totalsData?.totalExclSelling?.toFixed(2) || '0.00')}
//                         {column.id === 'totalVAT' && (totalsData?.totalVAT?.toFixed(2) || '0.00')}
//                         {column.id === 'card' && (totalCard?.toFixed(2) || '0.00')}
//                         {column.id === 'cash' && (totalCash?.toFixed(2) || '0.00')}
//                         {column.id === 'd_dep' && '0.00'}
//                         {column.id === 'acct' && '0.00'}
//                         {column.id === 'totalInclCost' && (totalsData?.totalInclCost?.toFixed(2) || '0.00')}
//                         {column.id === 'totalExclCost' && (totalsData?.totalExclCost?.toFixed(2) || '0.00')}
//                       </td>
//                     )
//                   )
//                 })}
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <style jsx>{`
//         .origin-top-right {
//           scrollbar-width: thin; /* For Firefox */
//         }
//         .origin-top-right::-webkit-scrollbar {
//           width: 6px;
//         }
//         .origin-top-right::-webkit-scrollbar-thumb {
//           background-color: #a0aec0; /* Color of the scrollbar thumb */
//           border-radius: 10px; /* Rounded corners */
//         }
//         .origin-top-right::-webkit-scrollbar-track {
//           background: #f7fafc; /* Color of the scrollbar track */
//         }
//         @media (min-width: 320px) {
//           #tableContainer {
//             font-size: 2px; /* Adjust font size for smallest screens */
//           }
//           #Date {
//             font-size: 10px;
//           }
//         }
//         @media (min-width: 640px) {
//           #tableContainer {
//             font-size: 10px; /* Adjust font size for small screens */
//           }
//           #Date {
//             font-size: 15px;
//           }
//         }
//         @media (min-width: 768px) {
//           #tableContainer {
//             font-size: 10px;
//           }
//           #Date {
//             font-size: 15px;
//           }
//           #ActionsButtons {
//             flex-direction: row;
//             gap: 0.5rem;
//           }
//           #ActionsButtons > * {
//             width: auto;
//           }
//         }
//         @media (min-width: 1024px) {
//           #tableContainer {
//             font-size: 12px; /* Adjust font size for large screens */
//           }
//           #Date {
//             font-size: 20px;
//           }
//         }
//         @media (min-width: 1280px) {
//           #tableContainer {
//             font-size: 12px; /* Adjust font size for extra large screens */
//           }
//           #Date {
//             font-size: 20px;
//           }
//         }
//       `}</style>
//     </Card>
//   )
// }

// export default ColumnVisibility
