/* eslint-disable newline-before-return */
'use client' // Add this line to mark the component as a client component

import React, { useState, useRef, useEffect } from 'react'

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

const Across_Report = () => {
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
  const [grandTotal, setGrandTotal] = useState(0) // State for grand total
  const [sorting, setSorting] = useState([]) // State for sorting
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (startDateFromURL) {
      setFilterStartDate(startDateFromURL) // Set filterStartDate to the value from URL
    }

    if (endDateFromURL) {
      setFilterEndDate(endDateFromURL) // Set filterEndDate to the value from URL
    }
  }, [startDateFromURL, endDateFromURL]) // Re-run if URL params change


  useEffect(() => {
    const fetchData = async () => {
        if (!session || !session.user || !session.user.id) {
          console.error('Session data not available')
          return
        }

        const token = `Bearer ${session.user.id}` // Ensure this is the correct token
        const config = { headers: { Authorization: token } }
            let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/accrossShopReport`

            const params = new URLSearchParams();
            // eslint-disable-next-line padding-line-between-statements
            if (filterStartDate) params.append('startDate', filterStartDate);
            if (filterEndDate) params.append('endDate', filterEndDate);
             if (params.toString()) apiUrl += `?${params.toString()}`

      try {
        const response = await axios.get(apiUrl, config)
        const responseData = response.data.finalResults || []

        setGrandTotal(response.data.grandTotalQty);
        console.log('Fetched Data:', responseData)

        if (Array.isArray(responseData) && responseData.length > 0) {
          setData(responseData);
          setColumns(generateColumns(responseData[0])) // Generate columns from first data item
        } else {
          console.error('Empty or invalid response data')
        }
      } catch (error) {
        console.error('Error fetching data:', error)

        if (error.response && error.response.status === 401) {
          await signOut({ redirect: false });
          router.push('/login')
        }
      }
    }

    fetchData()
  }, [session, filterStartDate, filterEndDate, router])
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

  const generateColumns = (dataItem) => {
    return Object.keys(dataItem).map(key =>
      columnHelper.accessor(key, {
        id: key,
        cell: info => info.getValue(),
        header: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the header
        enableSorting: true
      })
    );
  };


  const handleFilterChange = e => {
    const { name, value } = e.target

    if (name === 'start') {
      setFilterStartDate(value)
    } else {
      setFilterEndDate(value)
    }
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });


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

  const formatDate = date => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' }

    return date.toLocaleDateString(undefined, options)
  }

  const formatDateTime = DateTime => {
    const date = new Date(DateTime)
    const formattedDate = date.toLocaleDateString('en-GB') // Format as dd/mm/yyyy

    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit', // Include seconds
      hour12: true // Use 12-hour clock with AM/PM
    })

    return `${formattedDate} ${formattedTime}`
  }

  return (
    <Card ref={containerRef} id='main'>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-semibold text-primary'>
              <span className='sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>Across Report </span>
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


      <div className='p-2'>
        {/* Flex container for inputs */}
        <div className='flex flex-row items-center justify-between mb-4'>
          {/* Start Date section */}
          <div className=' flex-1 text-center mr-2' variant='contained'>
            <label htmlFor='start' className='form-label text-gray-700 font-semibold'>
              <b>Start Date : </b>
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
              <b>End Date : </b>
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

          <div className='flex-1 text-center '>
            <label htmlFor='end' className='form-label text-gray-700 font-semibold'>
              <b>Search : </b>
            </label>
            <input
              type='text'
              placeholder='Search...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
            <tfoot>
  <tr>
    {table.getAllColumns().map((column, index) => (
      <td key={index} className='p-1 border border-gray-200 text-center'>
        {console.log(column.id, "testing")}

        {/* Display "Total Qty" under the stockcode column */}
        {column.id.trim() === 'stockcode' ? 'Total Qty' : null}

        {/* Display grandTotal under the totalQty column */}
        {column.id.trim() === 'totalQty' ? grandTotal : null}
      </td>
    ))}
  </tr>
</tfoot>

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

export default Across_Report
