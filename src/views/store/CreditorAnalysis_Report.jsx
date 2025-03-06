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
import { format } from 'date-fns' // Import format from date-fns

import * as XLSX from 'xlsx'

import styles from '@core/styles/table.module.css'
import email from '../../../public/Assets/email.png'
import phone from '../../../public/Assets/phone.png'

const columnHelper = createColumnHelper()

const CreditorAnalysis_Report = () => {
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
  const [checkBalance, setCheckBalance] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dataDropDown, setDataDropDown] = useState([])

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
        if (!session || !session.user || !session.user.id) {
          console.error('Session data not available')

          return
        }

        const token = `Bearer ${session.user.id}`
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

  useEffect(() => {
    const GetAllCreditorAnalysisCmbPreviousAging = async () => {
      try {
        if (!session || !session.user || !session.user.id) {
          console.error('Session data not available')

          return
        }

        const token = `Bearer ${session.user.id}`
        const config = { headers: { Authorization: token } }
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/GetAllCreditorAnalysisCmbPreviousAging`
        const response = await axios.get(apiUrl, config)
        const responseData = response.data || []

        const cleanedData = Array.from(
          new Set(
            responseData.map(item => {
              const dateObj = new Date(item.currentagedate)

              return format(dateObj, 'yyyy-MM-dd hh:mm:ss a') // Format with AM/PM
            })
          )
        )

        setDataDropDown(cleanedData)
      } catch (error) {
        console.error('Error fetching data:', error)

        if (error.response && error.response.status === 401) {
          await signOut({ redirect: false })
          router.push('/login')
        }
      }
    }

    GetAllCreditorAnalysisCmbPreviousAging()
  }, [session, router])

  const handleDateChange = e => {
    setSelectedDate(e.target.value)
  }

  const handleFetchData = async () => {
    if (!selectedDate) {
      console.error('No date selected')

      return // Early exit if no date is selected
    }

    try {
      const token = `Bearer ${session.user.id}` // Ensure this is the correct token
      const config = { headers: { Authorization: token } }

      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL
      }/database/CreditorAnalysisReport?CmbPreviousAging=${encodeURIComponent(
        selectedDate
      )}&checkBalanceGreaterthanZero=${checkBalance}`

      // Validate API URL
      console.log('API URL:', apiUrl)

      const response = await axios.get(apiUrl, config)
      const responseData = response.data || []

      console.log('Fetched Data:', responseData)

      if (Array.isArray(responseData)) {
        setData(responseData) // Directly use the responseData

        console.log('Flattened Data:', responseData)
      } else {
        console.error('Empty or invalid response data')
      }

      const customColumns = [
        columnHelper.accessor('CreditorCode', {
          id: 'CreditorCode',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'CreditorCode',
          enableSorting: true
        }),

        columnHelper.accessor('CreditorName', {
          id: 'CreditorName',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'CreditorName',
          enableSorting: true
        }),
        columnHelper.accessor('creditorcell', {
          id: 'creditorcell',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'creditorcell',
          enableSorting: true
        }),
        columnHelper.accessor('creditorphone', {
          id: 'creditorphone',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'creditorphone',
          enableSorting: true
        }),
        columnHelper.accessor('creditoremail', {
          id: 'creditoremail',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'creditoremail',
          enableSorting: true
        }),
        columnHelper.accessor('totalBalance', {
          id: 'totalBalance',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'totalBalance',
          enableSorting: true
        }),
        columnHelper.accessor('balanceforward', {
          id: 'balanceforward',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'balanceforward',
          enableSorting: true
        }),
        columnHelper.accessor('currentbalance', {
          id: 'currentbalance',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: 'currentbalance',
          enableSorting: true
        }),
        columnHelper.accessor('30days', {
          id: '30days',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: '30days',
          enableSorting: true
        }),
        columnHelper.accessor('60days', {
          id: '60days',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: '60days',
          enableSorting: true
        }),
        columnHelper.accessor('90days', {
          id: '90days',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: '90days',
          enableSorting: true
        }),
        columnHelper.accessor('120days', {
          id: '120days',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: '120days',
          enableSorting: true
        }),
        columnHelper.accessor('150days', {
          id: '150days',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: '150days',
          enableSorting: true
        }),
        columnHelper.accessor('180days', {
          id: '180days',
          cell: info => (typeof info.getValue() === 'number' ? info.getValue().toFixed(2) : info.getValue()),
          header: '180days',
          enableSorting: true
        })
      ]

      setColumns(customColumns)

      const visibility = {}
      const clickedState = {}

      const defaultVisibleColumns = [
        'CreditorCode',
        'CreditorName',

        // 'creditorcell',

        // "creditorphone",
        // 'creditoremail',
        'totalBalance',
        'balanceforward',
        'currentbalance',
        '30days'

        // "60days",
        // "90days",
        // "120days",
        // "150days",
        // "180days",
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

  useEffect(() => {
    const filtered = data?.filter(item => {
      const itemDate = new Date(item.DateTime)
      const startDate = new Date(filterStartDate)
      const endDate = new Date(filterEndDate)

      endDate.setHours(23, 59, 59, 999)

      return (!filterStartDate || itemDate >= startDate) && (!filterEndDate || itemDate <= endDate)
    })

    setFilteredData(filtered)
  }, [filterStartDate, filterEndDate, data])

  // Filter data based on search term
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()

    const newData = data.filter(item => {
      return Object.values(item).some(value => String(value).toLowerCase().includes(lowercasedSearchTerm))
    })

    setFilteredData(newData)
  }, [searchTerm, data])

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
              <span className='sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>Creditor Analysis Report</span>
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
      <div className='p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto border border-gray-200'>
        <h2 className='text-2xl font-bold mb-6 text-gray-800 text-center'>Creditor Analysis</h2>

        <div className='mb-4 flex items-center'>
          <input
            type='checkbox'
            checked={checkBalance}
            onChange={() => setCheckBalance(prev => !prev)}
            className='mr-2 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
          />
          <span className='text-gray-700 font-medium'>Check Balance Greater than Zero</span>
        </div>

        <div className='mb-4'>
          <label htmlFor='dateTimeSelect' className='block text-gray-700 mb-2 font-medium'>
            Select Date and Time
          </label>
          <select
            id='dateTimeSelect'
            onChange={handleDateChange}
            value={selectedDate}
            className='w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out p-2'
          >
            <option value=''>Select a date and time</option>
            {dataDropDown.map((dateTime, index) => (
              <option key={index} value={dateTime}>
                {dateTime}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFetchData}
          className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-semibold w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Fetch Data
        </button>
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

export default CreditorAnalysis_Report
