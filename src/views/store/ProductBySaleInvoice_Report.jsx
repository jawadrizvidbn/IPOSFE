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

import { useDispatch, useSelector } from 'react-redux'

import styles from '@core/styles/table.module.css'
import email from '../../../public/Assets/email.png'
import phone from '../../../public/Assets/phone.png'
import { setStockOnHand, clearStockOnHand } from '../../redux/reducers/stockOnHandSlice'
import { openDB } from '../../../utils/indexedDB'

// Update with correct path
const columnHelper = createColumnHelper()

const ProductBySaleInvoice_Report = () => {
  const dispatch = useDispatch()
  const [columns, setColumns] = useState([])
  const [companyDetails, setCompanyDetails] = useState({})
  const containerRef = useRef(null)
  const [showMenu, setShowMenu] = useState(false)
  const [activeColumn, setActiveColumn] = useState(null)
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const id = new URLSearchParams(searchParams).get('id') // Extracting the id parameter value
  const startDateFromURL = searchParams.get('startDate') || '' // Default to empty if not found
  const endDateFromURL = searchParams.get('endDate') || '' // Default to empty if not found
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const router = useRouter()
  const [clickedButtons, setClickedButtons] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [sorting, setSorting] = useState([]) // State for sorting

  const [loading, setLoading] = useState(true) // Add loading state

  const [isFetching, setIsFetching] = useState(false)
  const [flattenedData, setFlattenedData] = useState([]) // Step 1
  const [originalData, setOriginalData] = useState([])
  const [allOverTotal, setAllOverTotal] = useState()

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

  const fetchData = async () => {
    setLoading(true)
    setIsFetching(true)

    try {
      if (!session || !session.user || !session.user.id) {
        console.error('Session data not available')

        return
      }

      const token = `Bearer ${session.user.id}`
      const config = { headers: { Authorization: token } }
      const tableNames = id
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/HistoryProductSaleByInvoiceReport?tableName=${id}`

      console.log('API URL:', apiUrl)

      const response = await axios.get(apiUrl, config)

      const responseData = response?.data || []

      setAllOverTotal(response?.data?.overallTotal)

      const flattenedData = responseData.finalResults.flatMap(({ transactions, salenum, total }) =>
        transactions.map(
          ({
            datetime,
            stockcode,
            stockdescription,
            qty,
            stockunitprice,
            paymenttype,
            averagecostprice,
            lastcostprice,
            linetotal,
            cashupnum
          }) => ({
            datetime,
            stockcode,
            stockdescription,
            qty,
            stockunitprice,
            paymenttype,
            averagecostprice,
            lastcostprice,
            linetotal,
            cashupnum,
            salenum,
            total
          })
        )
      )

      setFlattenedData(flattenedData)
      setOriginalData(flattenedData)

      const customColumns = [
        columnHelper.accessor('stockcode', {
          id: 'stockcode',
          cell: info => info.getValue(),
          header: 'Code',
          enableSorting: true
        }),
        columnHelper.accessor('stockdescription', {
          id: 'stockdescription',
          cell: info => info.getValue(),
          header: 'Description',
          enableSorting: true
        }),
        columnHelper.accessor('qty', {
          id: 'qty',
          cell: info => info.getValue(),
          header: 'Qty',
          enableSorting: true
        }),
        columnHelper.accessor('averagecostprice', {
          id: 'averagecostprice',
          cell: info => info.getValue(),
          header: 'U/Cost',
          enableSorting: true
        }),
        columnHelper.accessor('stockunitprice', {
          id: 'stockunitprice',
          cell: info => info.getValue(),
          header: 'Price',
          enableSorting: true
        }),
        columnHelper.accessor('linetotal', {
          id: 'linetotal',
          cell: info => info.getValue(),
          header: 'Line Total',
          enableSorting: true
        }),
        columnHelper.accessor('paymenttype', {
          id: 'paymenttype',
          cell: info => info.getValue(),
          header: 'Payment',
          enableSorting: true
        }),
        columnHelper.accessor('cashupnum', {
          id: 'cashupnum',
          cell: info => info.getValue(),
          header: 'Cashup No',
          enableSorting: true
        })
      ]

      setColumns(customColumns)

      const visibility = {}
      const clickedState = {}

      const defaultVisibleColumns = [
        'stockcode',
        'stockdescription',
        'qty',
        'stockunitprice',
        'paymenttype',
        'averagecostprice',
        'lastcostprice',
        'linetotal',
        'cashupnum'
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
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])
  useEffect(() => {
    const filtered = originalData.filter(item => {
      const itemDate = new Date(item.datetime)
      const startDate = new Date(filterStartDate)
      const endDate = new Date(filterEndDate)

      endDate.setHours(23, 59, 59, 999)

      return (!filterStartDate || itemDate >= startDate) && (!filterEndDate || itemDate <= endDate)
    })

    setFlattenedData(filtered)
  }, [filterStartDate, filterEndDate, originalData])

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
    data: flattenedData,
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

  const formatDateTime = datetime => {
    const date = new Date(datetime)
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
              <span className='sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>Product By Sale Invoice Report</span>
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
        <div className='flex flex-row items-center justify-between mb-4'>
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
            <p className='text-center sm:text-left text-base sm:text-lg' id='datetime'>
              <b>Date From: </b>
              {flattenedData.length > 0 && <span className='ml-1'>{formatDateTime(flattenedData[0].datetime)}</span>}
            </p>
          </div>
          <div className='mb-2 sm:mb-0'>
            <p className='text-center sm:text-left text-base sm:text-lg' id='datetime'>
              <b>To Date: </b>
              {flattenedData.length > 0 && (
                <span className='ml-1'>{formatDateTime(flattenedData[flattenedData.length - 1].datetime)}</span>
              )}
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
                  {columns &&
                    columns.map(column => (
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

      {isFetching ? (
        <div>Loading</div>
      ) : (
        <div id='tableContainer' className='sm:text-sm md:text-base lg:text-lg xl:text-xl' ref={containerRef}>
          {Object.values(
            flattenedData.reduce((acc, product) => {
              const key = product.salenum

              if (!acc[key]) {
                acc[key] = {
                  departmentInfo: {
                    salenum: product.salenum,

                    total: product.total // To hold the total for this ComputerName
                  },
                  products: []
                }
              }

              // Aggregate total for each ComputerName
              acc[key].departmentInfo.total += product.total
              acc[key].products.push(product)

              return acc
            }, {})
          ).map(
            (group, index) =>
              group.products &&
              group.products.length > 0 && (
                <div key={index} className='min-w-full bg-white border border-gray-200'>
                  <div className='bg-gray-100 flex justify-between p-2'>
                    <div className='mr-2'>
                      <strong>Invoice No : </strong> {group.departmentInfo.salenum}
                      {console.log(group, 'Testing group')}
                    </div>
                  </div>

                  <table className='min-w-full bg-white border border-gray-200'>
                    <thead className='bg-gray-100'>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className='cursor-pointer'
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div
                                className='border border-gray-200 text-center font-semibold text-gray-700 flex items-center justify-center'
                                id='Header'
                              >
                                {header.isPlaceholder ? null : (
                                  <>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted()
                                      ? header.column.getIsSorted() === 'asc'
                                        ? ' 🔼'
                                        : ' 🔽'
                                      : ''}
                                  </>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {group.products.map(product => {
                        const row = table.getRowModel().rows.find(r => r.original === product)

                        return (
                          <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id} className='p-1 border border-gray-200 text-center'>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        )
                      })}

                      <tr className='bg-gray-100'>
                        {table
                          .getAllColumns()
                          .filter(column => column.getIsVisible())
                          .map(column => (
                            <td key={column.id} className='p-1 border border-gray-200 text-center font-bold'>
                              {column.id === 'stockcode' && 'Invoice Totals : '}
                              {column.id === 'linetotal' && (group.departmentInfo.total || '0')}
                            </td>
                          ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
          )}
          {/* Footer for grand totals */}
          {allOverTotal && (
            <div className='min-w-full bg-white border border-gray-200 mt-4'>
              <table className='min-w-full bg-white border border-gray-200'>
                <tfoot>
                  <tr className='bg-gray-100'>
                    {table
                      .getAllColumns()
                      .filter(column => column.getIsVisible())
                      .map(column => (
                        <td key={column.id} className='p-1 border border-gray-200 text-center font-bold'>
                          {column.id === 'stockcode' && 'Overall Totals:'}
                          {column.id === 'linetotal' && (allOverTotal || '0')}
                        </td>
                      ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
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
          #DateTime {
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
          #DateTime {
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
          #DateTime {
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
          #DateTime {
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
          #DateTime {
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

export default ProductBySaleInvoice_Report
