'use client' // Add this line to mark the component as a client component

import React, { useState, useRef, useEffect } from 'react'

import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'

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

const StockOnHand_Report = () => {
  const dispatch = useDispatch()
  const stockData = useSelector(state => state.stockOnHand)
  const [allData, setAllData] = useState([]) // State to store all fetched data
  const [columns, setColumns] = useState([])
  const [companyDetails, setCompanyDetails] = useState({})
  const containerRef = useRef(null)
  const [showMenu, setShowMenu] = useState(false)
  const [activeColumn, setActiveColumn] = useState(null)
  const { data: session } = useSession()
  const router = useRouter()
  const [clickedButtons, setClickedButtons] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [sorting, setSorting] = useState([]) // State for sorting
  const [nodatamessage, setNoDataMessage] = useState('')
  const [loading, setLoading] = useState(true) // Add loading state

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 18000
  const [totalCount, setTotalCount] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [flattenedData, setFlattenedData] = useState([]) // Step 1
  const [departmentWithCategories, setDepartmentsWithCategories] = useState([]) // Step 1
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedMajorNo, setSelectedMajorNo] = useState('')
  const [selectedSub1No, setSelectedSub1No] = useState('')
  const [selectedSub2No, setSelectedSub2No] = useState('')
  const [hiddenProducts, setHiddenProducts] = useState(false)

  const searchParams = useSearchParams()
  const shopKey = searchParams.get('shopKey')
  const [settings, setSettings] = useState({
    includeNegativeStockonHand: false,
    includeNegativeLastCostPrice: false,
    includeNegativeAvarageCostPrice: false
  })

  const [ZeroSettings, setZeroSettings] = useState({
    includeZeroStockonHand: false,
    includeZeroLastCostPrice: false,
    includeZeroAvarageCostPrice: false
  })

  const [NegativeandZeroStock, setNegativeandZeroStock] = useState({
    includeOnlyPositiveStock: false // Changed to an object
  })

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        if (!session || !session.user || !session.user.token) {
          console.error('Session data not available')

          return
        }

        const token = `Bearer ${session.user.token}`
        const config = { headers: { Authorization: token } }
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/tblReg?shopKey=${shopKey}`

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
  }, [session?.user?.token, shopKey])

  useEffect(() => {
    const fetchDepartmentsAndCategories = async () => {
      try {
        const token = `Bearer ${session.user.token}`
        const config = { headers: { Authorization: token } }
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/allDepartmentWithCategories?shopKey=${shopKey}`

        const response = await axios.get(apiUrl, config)

        setDepartmentsWithCategories(response.data)
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    }

    fetchDepartmentsAndCategories()
  }, [session?.user?.token, shopKey])

  const handleDepartmentChange = e => {
    const value = e.target.value

    if (value) {
      try {
        const selectedValue = JSON.parse(value)

        setSelectedDepartment(selectedValue)
        setSelectedMajorNo(selectedValue.MajorNo)
        setSelectedSub1No('') // Reset sub1 and sub2 when department changes
        setSelectedSub2No('')
      } catch (error) {
        console.error('Error parsing selected department:', error)
      }
    } else {
      // Reset all selections if no department is selected
      setSelectedDepartment('')
      setSelectedMajorNo('')
      setSelectedSub1No('')
      setSelectedSub2No('')
    }
  }

  const handleSub1Change = e => {
    setSelectedSub1No(e.target.value)
    setSelectedSub2No('') // Reset sub2 when sub1 changes
  }

  const handleSub2Change = e => {
    setSelectedSub2No(e.target.value)
  }

  // Filter sub1 and sub2 based on selected values
  const filteredSub1Options = departmentWithCategories.filter(department => department.MajorNo === selectedMajorNo)

  const filteredSub2Options = departmentWithCategories.filter(
    department => department.MajorNo === selectedMajorNo && department.Sub1No === selectedSub1No
  )

  const handleZeroChange = event => {
    const { name, checked } = event.target

    setZeroSettings(prevSettings => ({
      ...prevSettings,
      [name]: checked
    }))
  }

  const handleZeroSelectAll = event => {
    const isChecked = event.target.checked

    setZeroSettings({
      // includeZeroLaybyeStock: isChecked,
      includeZeroStockonHand: isChecked,
      includeZeroLastCostPrice: isChecked,
      includeZeroAvarageCostPrice: isChecked
    })
  }

  const handleChange = event => {
    const { name, checked } = event.target

    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: checked
    }))
  }

  const handleSelectAll = event => {
    const isChecked = event.target.checked

    setSettings({
      // includeNegativeLaybyeStock: isChecked,
      includeNegativeStockonHand: isChecked,
      includeNegativeLastCostPrice: isChecked,
      includeNegativeAvarageCostPrice: isChecked
    })
  }

  // &includeZeroStockonHand=true&includeZeroLastCostPrice=true&includeZeroAvarageCostPrice=true&includeZeroLaybyeStock=true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = async () => {
    setLoading(true)
    setIsFetching(true)

    try {
      if (!session || !session.user || !session.user.token) {
        console.error('Session data not available')

        return
      }

      const token = `Bearer ${session.user.token}`
      const config = { headers: { Authorization: token } }
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/database/allTblDataProducts?majorNo=${selectedMajorNo}&sub1No=${selectedSub1No}&sub2No=${selectedSub2No}&includeNegativeStockonHand=${settings.includeNegativeStockonHand}&includeNegativeLastCostPrice=${settings.includeNegativeLastCostPrice}&includeNegativeAvarageCostPrice=${settings.includeNegativeAvarageCostPrice}&includeZeroStockonHand=${ZeroSettings.includeZeroStockonHand}&includeZeroLastCostPrice=${ZeroSettings.includeZeroLastCostPrice}&includeZeroAvarageCostPrice=${ZeroSettings.includeZeroAvarageCostPrice}&includeOnlyPositiveStock=${NegativeandZeroStock.includeOnlyPositiveStock}`

      console.log('API URL:', apiUrl)

      const response = await axios.get(apiUrl, config)
      const responseData = response?.data?.data || []
      const totalCount = response?.data?.totalCount || 0

      setTotalCount(totalCount)
      console.log('Total Count:', totalCount) // Log totalCount

      if (Array.isArray(responseData)) {
        // Flatten the data structure if needed
        // Flatten the data structure
        const flattenedData = responseData.flatMap(Department =>
          Department.products.map(product => ({
            ...product,
            MajorDescription: Department.MajorDescription,
            Sub1Description: Department.Sub1Description,
            CategorySub2Description: Department.CategorySub2Description,
            totalStockOnHand: Department.totalStockOnHand,
            totalAvarageCostPrice: Department.totalAvarageCostPrice,
            totalLastCostPrice: Department.totalLastCostPrice,
            totalLaybyeStock: Department.totalLaybyeStock,
            totalSelling: Department.totalSelling
          }))
        )

        setFlattenedData(flattenedData) // Corrected to use the flattened data
      } else {
        console.error('Empty or invalid response data')
      }

      // Column configuration remains the same as before
      const customColumns = [
        columnHelper.accessor('StockCode', {
          id: 'StockCode',
          cell: info => info.getValue(),
          header: 'Stock Code',
          enableSorting: true
        }),
        columnHelper.accessor('StockBarCode', {
          id: 'StockBarCode',
          cell: info => info.getValue(),
          header: 'Bar Code',
          enableSorting: true
        }),
        columnHelper.accessor('Description1', {
          id: 'Description1',
          cell: info => info.getValue(),
          header: 'Description',
          enableSorting: true
        }),
        columnHelper.accessor('StockonHand', {
          id: 'StockonHand',
          cell: info => info.getValue(),
          header: 'SOH',
          enableSorting: true
        }),
        columnHelper.accessor('LaybyeStock', {
          id: 'LaybyeStock',
          cell: info => info.getValue(),
          header: 'Laybye',
          enableSorting: true
        }),
        columnHelper.accessor('LastCostPrice', {
          id: 'LastCostPrice',
          cell: info => info.getValue(),
          header: 'U/LastCost',
          enableSorting: true
        }),
        columnHelper.accessor('AvarageCostPrice', {
          id: 'AvarageCostPrice',
          cell: info => info.getValue(),
          header: 'U/AvgCost',
          enableSorting: true
        }),

        columnHelper.accessor('TotalAvarageCostPrice', {
          id: 'TotalAvarageCostPrice',
          cell: info => info.getValue(),
          header: 'TAvgCost',
          enableSorting: true
        }),

        columnHelper.accessor('TotalLastCostPrice', {
          id: 'TotalLastCostPrice',
          cell: info => info.getValue(),
          header: 'TLastCost',
          enableSorting: true
        }),

        columnHelper.accessor('DefaultSellingPrice', {
          id: 'DefaultSellingPrice',
          cell: info => info.getValue(),
          header: 'U/Selling',
          enableSorting: true
        }),

        columnHelper.accessor('TotalSelling', {
          id: 'TotalSelling',
          cell: info => info.getValue(),
          header: 'TSelling',
          enableSorting: true
        })
      ]

      setColumns(customColumns)

      const visibility = {}
      const clickedState = {}

      const defaultVisibleColumns = [
        'StockCode',
        'StockBarCode',
        'Description1',
        'StockonHand',
        'LaybyeStock',
        'DefaultSellingPrice',
        'TotalAvarageCostPrice',
        'AvarageCostPrice',
        'TotalSelling'
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
    if (selectedMajorNo || selectedSub1No || selectedSub2No) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, selectedMajorNo, selectedSub1No, selectedSub2No])

  useEffect(() => {
    if (
      settings.includeNegativeAvarageCostPrice ||
      settings.includeNegativeLastCostPrice ||
      settings.includeNegativeStockonHand
    )
      fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, settings])

  useEffect(() => {
    if (
      ZeroSettings.includeZeroAvarageCostPrice ||
      ZeroSettings.includeZeroLastCostPrice ||
      // ZeroSettings.includeZeroLaybyeStock ||
      ZeroSettings.includeZeroStockonHand
    )
      fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, ZeroSettings])

  const AllDepartmentsRecords = () => {
    fetchData()
  }

  const AllDepartmentsTotalsRecords = () => {
    setHiddenProducts(true)
    fetchData()
  }

  const AllDepartmentsTotalsRecordsWithoutNegative_zeroStock = () => {
    // Set includeOnlyPositiveStock to true
    setNegativeandZeroStock(prevState => ({
      ...prevState,
      includeOnlyPositiveStock: true
    }))
  }

  // Trigger fetchData when the state updates
  useEffect(() => {
    if (NegativeandZeroStock.includeOnlyPositiveStock) {
      // Call fetchData API when includeOnlyPositiveStock becomes true
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NegativeandZeroStock.includeOnlyPositiveStock]) // This will run when includeOnlyPositiveStock changes

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

  return (
    <Card ref={containerRef} id='main'>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-semibold text-primary'>
              <span className='sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>Stock On Hand Report</span>
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

      {/* <div className='p-2'>

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
      </div> */}

      {/* <div className='flex justify-center'>
        <div className='flex flex-col sm:flex-row sm:space-x-4 mb-3'>
          <div className='mb-2 sm:mb-0'>
            <p className='text-center sm:text-left text-base sm:text-lg' id='DateTime'>
              <b>Date From: </b>
              {data?.length > 0 && <span className='ml-1'>{formatDateTime(data[0].DateTime)}</span>}
            </p>
          </div>
          <div className='mb-2 sm:mb-0'>
            <p className='text-center sm:text-left text-base sm:text-lg' id='DateTime'>
              <b>To Date: </b>
              {data?.length > 0 && <span className='ml-1'>{formatDateTime(data[data.length - 1].DateTime)}</span>}
            </p>
          </div>
        </div>
      </div> */}

      <div className='p-6 bg-white shadow-lg rounded-lg'>
        <div className='flex flex-row items-center justify-between mb-6'>
          <div className='flex-1 mr-4'>
            <select
              id='department'
              value={selectedDepartment ? JSON.stringify(selectedDepartment) : ''}
              onChange={handleDepartmentChange}
              className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>Select a Department</option>
              {departmentWithCategories.map(department => (
                <option
                  key={`${department.MajorNo}-${department.Sub1No}-${department.Sub2No}-${department.MajorDescription}`}
                  value={JSON.stringify({
                    MajorNo: department.MajorNo,
                    Sub1No: department.Sub1No,
                    Sub2No: department.Sub2No
                  })}
                >
                  {department.MajorDescription} - {department.Sub1Description} - {department.Sub2Description}
                </option>
              ))}
            </select>
          </div>

          <div className='flex-1 mr-4'>
            <select
              id='sub1'
              value={selectedSub1No}
              onChange={handleSub1Change}
              className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>Select Sub1</option>
              {filteredSub1Options.map(sub1 => (
                <option key={`${sub1.Sub1No}-${sub1.Sub1Description}`} value={sub1.Sub1No}>
                  {sub1.Sub1Description}
                </option>
              ))}
            </select>
          </div>

          <div className='flex-1 mr-4'>
            <select
              id='sub2'
              value={selectedSub2No}
              onChange={handleSub2Change}
              className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>Select Sub2</option>
              {filteredSub2Options.map(sub2 => (
                <option key={`${sub2.Sub2No}-${sub2.Sub2Description}`} value={sub2.Sub2No}>
                  {sub2.Sub2Description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='p-6 bg-white shadow-lg rounded-lg'>
          <div className='flex flex-row items-center justify-between mb-6'>
            <div className='flex-1 mr-4'>
              <Button
                className='btn btn-secondary ml-2'
                style={{ fontSize: '14px' }}
                variant='contained'
                onClick={AllDepartmentsRecords}
              >
                All Departments Record
              </Button>
            </div>
            <div className='flex-1 mr-4'>
              <Button
                className='btn btn-secondary ml-2'
                style={{ fontSize: '14px' }}
                variant='contained'
                onClick={AllDepartmentsTotalsRecords}
              >
                All Departments Record Total
              </Button>
            </div>
            <div className='flex-1 mr-4'>
              <Button
                className='btn btn-secondary ml-2'
                style={{ fontSize: '14px' }}
                variant='contained'
                onClick={AllDepartmentsTotalsRecordsWithoutNegative_zeroStock}
              >
                All Departments Record Without Negative & Zero Stock
              </Button>
            </div>
          </div>
        </div>
        <div className='flex flex-row items-start justify-between mb-6'>
          {/* Having Less Than Zero Stock Section */}
          <div className='flex-1 mr-4'>
            <h2 className='text-xl font-semibold mb-3'>Negative Stock</h2>
            <div className='flex flex-col'>
              <label className='flex items-center mb-2'>
                <input
                  type='checkbox'
                  checked={
                    settings.includeNegativeStockonHand &&
                    settings.includeNegativeLastCostPrice &&
                    settings.includeNegativeAvarageCostPrice
                  }
                  onChange={handleSelectAll}
                  className='form-checkbox h-5 w-5 text-blue-600 mr-2'
                />
                Select All
              </label>
              {[
                // 'includeNegativeLaybyeStock',
                'includeNegativeStockonHand',
                'includeNegativeLastCostPrice',
                'includeNegativeAvarageCostPrice'
              ].map(name => (
                <label key={name} className='flex items-center mb-2'>
                  <input
                    type='checkbox'
                    name={name}
                    checked={settings[name]}
                    onChange={handleChange}
                    className='form-checkbox h-5 w-5 text-blue-600 mr-2'
                  />
                  {name.replace(/includeNegative|([A-Z])/g, (match, p1) => (p1 ? ' ' + p1.toLowerCase() : ' ')).trim()}
                </label>
              ))}
            </div>
          </div>

          {/* Zero Stock Check Section */}
          <div className='flex-1'>
            <h2 className='text-xl font-semibold mb-3'>Zero Stock Check</h2>
            <div className='flex flex-col'>
              <label className='flex items-center mb-2'>
                <input
                  type='checkbox'
                  checked={
                    ZeroSettings.includeZeroStockonHand &&
                    ZeroSettings.includeZeroLastCostPrice &&
                    ZeroSettings.includeZeroAvarageCostPrice
                  }
                  onChange={handleZeroSelectAll}
                  className='form-checkbox h-5 w-5 text-blue-600 mr-2'
                />
                Select All
              </label>
              {[
                // 'includeZeroLaybyeStock',
                'includeZeroStockonHand',
                'includeZeroLastCostPrice',
                'includeZeroAvarageCostPrice'
              ].map(name => (
                <label key={name} className='flex items-center mb-2'>
                  <input
                    type='checkbox'
                    name={name}
                    checked={ZeroSettings[name]}
                    onChange={handleZeroChange}
                    className='form-checkbox h-5 w-5 text-blue-600 mr-2'
                  />
                  {name.replace(/includeZero|([A-Z])/g, (match, p1) => (p1 ? ' ' + p1.toLowerCase() : ' ')).trim()}
                </label>
              ))}
            </div>
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
              const key = `${product.MajorDescription}-${product.Sub1Description}-${product.CategorySub2Description}`

              if (!acc[key]) {
                acc[key] = {
                  departmentInfo: {
                    MajorDescription: product.MajorDescription,
                    Sub1Description: product.Sub1Description,
                    CategorySub2Description: product.CategorySub2Description,
                    totalStockOnHand: product.totalStockOnHand,
                    totalAvarageCostPrice: product.totalAvarageCostPrice,
                    totalLastCostPrice: product.totalLastCostPrice,
                    totalLaybyeStock: product.totalLaybyeStock,
                    totalSelling: product.totalSelling
                  },
                  products: []
                }
              }

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
                      <strong>Main :</strong> {group.departmentInfo.MajorDescription}
                    </div>
                    <div>
                      <strong>Sub 1 :</strong> {group.departmentInfo.Sub1Description || '-'}
                    </div>
                    <div>
                      <strong>Sub 2 :</strong> {group.departmentInfo.CategorySub2Description || '-'}
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
                      {hiddenProducts === true
                        ? ''
                        : group.products.map(product => {
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
                              {column.id === 'StockCode' && 'Group Totals: '}
                              {column.id === 'StockonHand' && (group.departmentInfo.totalStockOnHand || '0')}
                              {column.id === 'TotalSelling' && (group.departmentInfo.totalSelling || '0')}
                              {column.id === 'LaybyeStock' && (group.departmentInfo.totalLaybyeStock || '0')}
                              {column.id === 'TotalAvarageCostPrice' &&
                                (group.departmentInfo.totalAvarageCostPrice || '0')}
                              {column.id === 'TotalLastCostPrice' && (group.departmentInfo.totalLastCostPrice || '0')}
                            </td>
                          ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
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

export default StockOnHand_Report
