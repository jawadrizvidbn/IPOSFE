'use client'

import React, { useState, useRef, useEffect } from 'react'

import Image from 'next/image'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import axios from 'axios'
import { signOut, useSession } from 'next-auth/react'

import styles from '@core/styles/table.module.css'
import email from '../../../public/Assets/email.png'
import phone from '../../../public/Assets/phone.png'

const columnHelper = createColumnHelper()

const ColumnVisibility = () => {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [companyDetails, setCompanyDetails] = useState({})
  const containerRef = useRef(null)
  const { data: session } = useSession()
  const [earliestDate, setEarliestDate] = useState('')
  const [latestDate, setLatestDate] = useState('')

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        if (!session || !session.user || !session.user.token) {
          console.error('Session data not available')

          return
        }

        const token = session?.user?.token ? `Bearer ${session.user.token}` : ''
        const config = { headers: { Authorization: token } }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/greystrstockmaster/tblreg`

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
    const fetchData = async () => {
      try {
        if (!session || !session.user || !session.user.token) {
          console.error('Session data not available')

          return
        }

        const token = session?.user?.token ? `Bearer ${session.user.token}` : ''
        const config = { headers: { Authorization: token } }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/crownhistory/departmentsSalesReports/202309tbldata_current_tran`

        const response = await axios.get(apiUrl, config)

        const history_item_sale = response?.data?.formattedStockCodes

        // Extract the dates and set them in the state
        const earliestDate = response?.data?.earliestDate
        const latestDate = response?.data?.latestDate

        setEarliestDate(earliestDate)
        setLatestDate(latestDate)

        const customColumns = [
          columnHelper.accessor('stockcode', {
            id: 'item.stockcodes',
            cell: info => info.getValue(),
            header: 'Stock Code'
          }),
          columnHelper.accessor('description', {
            id: 'stockdescription',
            cell: info => info.getValue(),
            header: 'Description'
          }),
          columnHelper.accessor('type', {
            id: 'type',
            cell: info => info.getValue(),
            header: 'Type'
          }),
          columnHelper.accessor('size', {
            id: 'size',
            cell: info => info.getValue(),
            header: 'Size'
          }),
          columnHelper.accessor('qty', {
            id: 'totalQuantity',
            cell: info => info.getValue(),
            header: 'Qty'
          }),
          columnHelper.accessor('tCost', {
            id: 'totalCostPrice',
            cell: info => info.getValue(),
            header: 'T Cost'
          }),
          columnHelper.accessor('tSelling', {
            id: 'totalSelling',
            cell: info => info.getValue(),
            header: 'T Selling'
          }),
          columnHelper.accessor('gpPercent', {
            id: 'totalGPP',
            cell: info => info.getValue(),
            header: 'GP%'
          }),
          columnHelper.accessor('gpv', {
            id: 'totalGpValue',
            cell: info => info.getValue(),
            header: 'GPV'
          })
        ]

        // Set columns and default visibility
        setColumns(customColumns)
        const visibility = {}

        customColumns.forEach((column, index) => {
          visibility[column.id] = index < 5 // Show only the first eight columns by default
        })
        setColumnVisibility(visibility)
        setData(history_item_sale)
      } catch (error) {
        console.error('Error fetching or setting sales data:', error)

        if (error.response && error.response.data && error.response.data.message === 'Invalid token') {
          console.log('Invalid token. Clearing localStorage...')
          localStorage.removeItem('userData')
        }
      }
    }

    fetchData()
  }, [session])

  const handleColumnVisibilityChange = event => {
    const value = event.target.value
    const newVisibility = {}

    columns.forEach(column => {
      newVisibility[column.id] = value.includes(column.id)
    })
    setColumnVisibility(newVisibility)
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel()
  })

  const generatePDF = async () => {
    try {
      const container = containerRef.current
      const buttonRow = container.querySelector('.exclude-from-pdf')

      buttonRow.style.display = 'none'

      const scale = 3

      const canvas = await html2canvas(container, {
        scrollY: -window.scrollY,

        scale,

        useCORS: true
      })

      buttonRow.style.display = 'flex'

      const imageData = canvas.toDataURL('image/jpeg', 1.0)
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      const ratio = containerWidth / containerHeight
      const pdfWidth = 210
      const pdfHeight = pdfWidth / ratio
      const pdf = new jsPDF('p', 'mm', 'a4')

      let pdfHeightLeft = pdfHeight
      let position = 0

      while (pdfHeightLeft > 0) {
        pdf.addImage(imageData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST')
        pdfHeightLeft -= pdfHeight
        position -= pdfHeight

        if (pdfHeightLeft > 0) {
          pdf.addPage()
        }
      }

      pdf.save('GreystrHistory_April_Daily_sales_Report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
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
    <Card ref={containerRef}>
      <div className='flex justify-center'>
        <CardHeader
          title='History Item Sales'
          className='gap-2 flex-col items-start sm:flex-row sm:items-center text-center'
          titleTypographyProps={{
            style: {
              margin: 0,
              fontFamily: '__Inter_10a487', // Font family
              fontWeight: 700, // Font weight
              fontSize: '2.125rem', // Font size
              lineHeight: 4.5556, // Line height
              color: 'rgb(92 71 129 / 90%)', // Text color
              display: 'block'
            }
          }}
          sx={{
            '& .MuiCardHeader-action': { m: 0 }
          }}
        />
      </div>

      <div className='flex m-5'>
        <div className='w-full sm:w-6/12 md:w-8/12 lg:w-9/12 m-3'>
          <h4 className='font-semibold text-left'>{companyDetails?.Company}</h4>
          <p className='text-left'>{companyDetails?.Addr1}</p>
          <div className='flex flex-col md:flex-row'>
            <div className='md:w-6/12'>
              <p className='text-left'>{companyDetails?.Addr2}</p>
              <p className='text-left'>{companyDetails?.Addr3}</p>
            </div>
            <div className='md:w-6/12'>
              <div className='flex items-center my-2'>
                <Image src={phone} width='20' height='20' alt='Phone' />
                <p className='ml-2'>{companyDetails?.Phone}</p>
              </div>
              <div className='flex flex-wrap items-center my-2'>
                <Image src={email} className='w-5 h-5' alt='Email' />
                <p className='ml-2'>{companyDetails?.Fax}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='row p-3 d-flex align-items-center exclude-from-pdf'>
        <div className='col-md-12 d-flex align-items-center flex-wrap'>
          <FormControl variant='outlined' className='mr-2'>
            <InputLabel>Visible Columns</InputLabel>
            <Select
              multiple
              value={Object.keys(columnVisibility).filter(columnId => columnVisibility[columnId])}
              onChange={handleColumnVisibilityChange}
              label='Visible Columns'
              renderValue={selected => selected.join(', ')}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              {columns.map(column => (
                <MenuItem key={column.id} value={column.id}>
                  {column.header}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button className='btn btn-secondary mr-2 ' variant='contained'>
            Copy
          </Button>
          <Button className='btn btn-secondary mr-2 ' variant='contained'>
            CSV
          </Button>
          <Button className='btn btn-secondary mr-2 ' variant='contained'>
            Excel
          </Button>
          <Button className='btn btn-secondary mr-2 ' variant='contained' onClick={generatePDF}>
            PDF
          </Button>
          <Button className='btn btn-secondary' variant='contained'>
            Print
          </Button>
        </div>
      </div>
      <div id='tableContainer' className='overflow-x-auto'>
        <table className={styles.table}>
          <thead>
            {table &&
              table
                .getHeaderGroups()
                .map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(
                      header =>
                        columnVisibility[header.id] && (
                          <th key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        )
                    )}
                  </tr>
                ))}
          </thead>

          <tbody>
            {/* Add the date range display */}
            {/* Conditionally render the date range display */}
            {earliestDate && latestDate && (
              <div className='flex m-5'>
                <div className='w-full sm:w-6/12 md:w-8/12 lg:w-9/12 m-3'>
                  <div className='flex flex-row'>
                    <div className='mr-4'>
                      <p className='text-left'>Date From: {formatDate(earliestDate)}</p>
                    </div>
                    <div>
                      <p className='text-left'>To: {formatDate(latestDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Iterate over each department */}
            {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                {/* Department data */}
                <tr>
                  <td colSpan={3}>
                    <div className='flex flex-row justify-between'>
                      <h3>Department: {formatValue(row.original.MajorDescription)}</h3>
                      <h4>Sub1: {formatValue(row.original.Sub1Description)}</h4>
                      <h4>Sub2: {formatValue(row.original.Sub2Description)}</h4>
                    </div>
                  </td>
                </tr>

                {/* Iterate over stock codes within each department */}
                {Object.keys(row.original.stockcodes).map(stockCodeKey => {
                  const stockCodeData = row.original.stockcodes[stockCodeKey]

                  return (
                    <React.Fragment key={stockCodeKey}>
                      <tr>
                        {columns.map(
                          column =>
                            columnVisibility[column.id] && (
                              <td key={column.id}>
                                {column.id === 'item.stockcodes' && stockCodeData.stockcode}
                                {column.id === 'stockdescription' && stockCodeData.stockdescription}
                                {column.id === 'totalQuantity' && formatDecimal(stockCodeData.totalQuantity)}
                                {column.id === 'totalCostPrice' && formatDecimal(stockCodeData.totalCostPrice)}
                                {column.id === 'totalSelling' && formatDecimal(stockCodeData.totalSelling)}
                                {column.id === 'totalGPP' && formatDecimal(stockCodeData.totalGPP)}
                                {column.id === 'totalGpValue' && formatDecimal(stockCodeData.totalGpValue)}
                              </td>
                            )
                        )}
                      </tr>
                    </React.Fragment>
                  )
                })}
                <tr>
                  <td colSpan={4}>Department Totals:</td>
                  {columnVisibility['totalQuantity'] && (
                    <td colSpan={1}>{formatDecimal(row.original.totalQuantity)}</td>
                  )}
                  {columnVisibility['totalCostPrice'] && (
                    <td colSpan={1}>{formatDecimal(row.original.totalAverageCostPrice)}</td>
                  )}
                  {columnVisibility['totalSelling'] && <td colSpan={2}>{formatDecimal(row.original.totalSelling)}</td>}
                  {columnVisibility['totalGpValue'] && <td colSpan={1}>{formatDecimal(row.original.totalGpValue)}</td>}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default ColumnVisibility

// 'use client'

// import React, { useState, useRef, useEffect } from 'react'

// import Image from 'next/image'

// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import Select from '@mui/material/Select'
// import MenuItem from '@mui/material/MenuItem'
// import FormControl from '@mui/material/FormControl'
// import InputLabel from '@mui/material/InputLabel'
// import Button from '@mui/material/Button'
// import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
// import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas'
// import axios from 'axios'
// import { signOut, useSession } from 'next-auth/react'

// import styles from '@core/styles/table.module.css'
// import email from '../../../public/Assets/email.png'
// import phone from '../../../public/Assets/phone.png'

// const columnHelper = createColumnHelper()

// const ColumnVisibility = () => {
//   const [data, setData] = useState([])
//   const [columns, setColumns] = useState([])
//   const [columnVisibility, setColumnVisibility] = useState({})
//   const [companyDetails, setCompanyDetails] = useState({})
//   const containerRef = useRef(null)
//   const { data: session } = useSession()
//   const [earliestDate, setEarliestDate] = useState('')
//   const [latestDate, setLatestDate] = useState('')

//   useEffect(() => {
//     const fetchCompanyDetails = async () => {
//       try {
//         if (!session || !session.user || !session.user.token) {
//           console.error('Session data not available')

//           return;
//         }

//         const token = session?.user?.id ? `Bearer ${session.user.token}` : ''
//         const config = { headers: { Authorization: token } };

//         const apiUrl = '${process.env.NEXT_PUBLIC_API_URL}/greystrstockmaster/tblreg'

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
//         if (!session || !session.user || !session.user.token) {
//           console.error('Session data not available');

//           return
//         }

//         const token = session?.user?.id ? `Bearer ${session.user.token}` : '';
//         const config = { headers: { Authorization: token } };

//         const apiUrl = '${process.env.NEXT_PUBLIC_API_URL}/crownhistory/departmentsSalesReports/202309tbldata_current_tran'

//         const response = await axios.get(apiUrl, config)

//         const history_item_sale = response?.data?.formattedStockCodes

//         // Extract the dates and set them in the state
//         const earliestDate = response?.data?.earliestDate
//         const latestDate = response?.data?.latestDate

//         setEarliestDate(earliestDate)
//         setLatestDate(latestDate)

//         const customColumns = [
//           columnHelper.accessor('stockcode', {
//             id: 'item.stockcodes',
//             cell: info => info.getValue(),
//             header: 'Stock Code'
//           }),
//           columnHelper.accessor('description', {
//             id: 'stockdescription',
//             cell: info => info.getValue(),
//             header: 'Description'
//           }),
//           columnHelper.accessor('type', {
//             id: 'type',
//             cell: info => info.getValue(),
//             header: 'Type'
//           }),
//           columnHelper.accessor('size', {
//             id: 'size',
//             cell: info => info.getValue(),
//             header: 'Size'
//           }),
//           columnHelper.accessor('qty', {
//             id: 'totalQuantity',
//             cell: info => info.getValue(),
//             header: 'Qty'
//           }),
//           columnHelper.accessor('tCost', {
//             id: 'totalCostPrice',
//             cell: info => info.getValue(),
//             header: 'T Cost'
//           }),
//           columnHelper.accessor('tSelling', {
//             id: 'totalSelling',
//             cell: info => info.getValue(),
//             header: 'T Selling'
//           }),
//           columnHelper.accessor('gpPercent', {
//             id: 'totalGPP',
//             cell: info => info.getValue(),
//             header: 'GP%'
//           }),
//           columnHelper.accessor('gpv', {
//             id: 'totalGpValue',
//             cell: info => info.getValue(),
//             header: 'GPV'
//           })
//         ]

//         // Set columns and default visibility
//         setColumns(customColumns)
//         const visibility = {}

//         customColumns.forEach((column, index) => {
//           visibility[column.id] = index < 5 // Show only the first eight columns by default
//         })
//         setColumnVisibility(visibility)
//         setData(history_item_sale)

//       } catch (error) {
//         console.error('Error fetching or setting sales data:', error)

//         if (error.response && error.response.data && error.response.data.message === 'Invalid token') {
//           console.log('Invalid token. Clearing localStorage...')
//           localStorage.removeItem('userData')
//         }
//       }
//     }

//     fetchData()
//   }, [session])

//   const handleColumnVisibilityChange = event => {
//     const value = event.target.value
//     const newVisibility = {}

//     columns.forEach(column => {
//       newVisibility[column.id] = value.includes(column.id)
//     })
//     setColumnVisibility(newVisibility)
//   }

//   const table = useReactTable({
//     data,
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
//       const buttonRow = container.querySelector('.exclude-from-pdf')

//       buttonRow.style.display = 'none'

//       const scale = 3

//       const canvas = await html2canvas(container, {

//         scrollY: -window.scrollY,

//         scale,

//         useCORS: true
//       })

//       buttonRow.style.display = 'flex'

//       const imageData = canvas.toDataURL('image/jpeg', 1.0)
//       const containerWidth = container.offsetWidth
//       const containerHeight = container.offsetHeight
//       const ratio = containerWidth / containerHeight
//       const pdfWidth = 210
//       const pdfHeight = pdfWidth / ratio
//       const pdf = new jsPDF('p', 'mm', 'a4')

//       let pdfHeightLeft = pdfHeight
//       let position = 0

//       while (pdfHeightLeft > 0) {
//         pdf.addImage(imageData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST')
//         pdfHeightLeft -= pdfHeight
//         position -= pdfHeight

//         if (pdfHeightLeft > 0) {
//           pdf.addPage()
//         }
//       }

//       pdf.save('GreystrHistory_April_Daily_sales_Report.pdf')
//     } catch (error) {
//       console.error('Error generating PDF:', error)
//     }
//   }

//   const formatDate = dateString => {
//     const options = { year: 'numeric', month: 'long', day: 'numeric' }

//     return new Date(dateString).toLocaleDateString(undefined, options)
//   }

//   const formatTime = dateString => {
//     const options = { hour: '2-digit', minute: '2-digit' }

//     return new Date(dateString).toLocaleTimeString(undefined, options)
//   }

//   return (
//     <Card ref={containerRef}>
//       <div className='flex justify-center'>
//         <CardHeader
//           title='History Item Sales'
//           className='gap-2 flex-col items-start sm:flex-row sm:items-center text-center'
//           titleTypographyProps={{
//             style: {
//               margin: 0,
//               fontFamily: '__Inter_10a487', // Font family
//               fontWeight: 700, // Font weight
//               fontSize: '2.125rem', // Font size
//               lineHeight: 4.5556, // Line height
//               color: 'rgb(92 71 129 / 90%)', // Text color
//               display: 'block',
//             },
//           }}
//           sx={{
//             '& .MuiCardHeader-action': { m: 0 },
//           }}
//         />
//       </div>

//       <div className='flex m-5'>
//         <div className='w-full sm:w-6/12 md:w-8/12 lg:w-9/12 m-3'>
//           <h4 className='font-semibold text-left'>
//             {companyDetails?.Company}
//           </h4>
//           <p className='text-left'>{companyDetails?.Addr1}</p>
//           <div className='flex flex-col md:flex-row'>
//             <div className='md:w-6/12'>
//               <p className='text-left'>{companyDetails?.Addr2}</p>
//               <p className='text-left'>{companyDetails?.Addr3}</p>
//             </div>
//             <div className='md:w-6/12'>
//               <div className='flex items-center my-2'>
//                 <Image src={phone} width='20' height='20' alt='Phone' />
//                 <p className='ml-2'>{companyDetails?.Phone}</p>
//               </div>
//               <div className='flex flex-wrap items-center my-2'>
//                 <Image src={email} className='w-5 h-5' alt='Email' />
//                 <p className='ml-2'>{companyDetails?.Fax}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className='row p-3 d-flex align-items-center exclude-from-pdf'>
//         <div className='col-md-12 d-flex align-items-center flex-wrap'>
//           <FormControl variant='outlined' className='mr-2'>
//             <InputLabel>Visible Columns</InputLabel>
//             <Select
//               multiple
//               value={Object.keys(columnVisibility).filter(columnId => columnVisibility[columnId])}
//               onChange={handleColumnVisibilityChange}
//               label='Visible Columns'
//               renderValue={selected => selected.join(', ')}
//               MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
//             >
//               {columns.map(column => (
//                 <MenuItem key={column.id} value={column.id}>
//                   {column.header}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <Button className='btn btn-secondary mr-2 ' variant='contained'>
//             Copy
//           </Button>
//           <Button className='btn btn-secondary mr-2 ' variant='contained'>
//             CSV
//           </Button>
//           <Button className='btn btn-secondary mr-2 ' variant='contained'>
//             Excel
//           </Button>
//           <Button className='btn btn-secondary mr-2 ' variant='contained' onClick={generatePDF}>
//             PDF
//           </Button>
//           <Button className='btn btn-secondary' variant='contained'>
//             Print
//           </Button>
//         </div>
//       </div>
//       <div id='tableContainer' className='overflow-x-auto'>
//         <table className={styles.table}>
//           <thead>
//             {table &&
//               table.getHeaderGroups().map(headerGroup => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map(header => (
//                     columnVisibility[header.id] && (
//                       <th key={header.id}>
//                         {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                       </th>
//                     )
//                   ))}
//                 </tr>
//               ))}
//           </thead>

//           <tbody>

//             {/* Add the date range display */}
//             {/* Conditionally render the date range display */}
//             {earliestDate && latestDate && (
//               <div className='flex m-5'>
//                 <div className='w-full sm:w-6/12 md:w-8/12 lg:w-9/12 m-3'>
//                   <h4 className='font-semibold text-left'>
//                     Sales Report Date Range:
//                   </h4>
//                   <p className='text-left'>
//                     From: {formatDate(earliestDate)}
//                   </p>
//                   <p className='text-left'>
//                     To: {formatDate(latestDate)}
//                   </p>
//                 </div>
//               </div>
//             )}
//             {/* Iterate over each department */}
//             {table.getRowModel().rows.map(row => (
//               <React.Fragment key={row.id}>
//                 {/* Department data */}
//                 <tr>
//                   <td colSpan={8}>

//                     <h3>Department: {row.original.MajorDescription}</h3>
//                     <h4>Sub1: {row.original.Sub1Description}</h4>

//                     {/* {console.log(row.original, "zohaibrana")} */}

//                     <p>Total Quantity: {row.original.totalQuantity}</p>
//                     <p>Total Selling: {row.original.totalSelling}</p>
//                     <p>Total Average Cost Price: {row.original.totalAverageCostPrice}</p>
//                     {/* Add more department data fields as needed */}
//                   </td>
//                 </tr>
//                 {/* Iterate over stock codes within each department */}
//                 {Object.keys(row.original.stockcodes).map(stockCodeKey => {
//                   const stockCodeData = row.original.stockcodes[stockCodeKey];

//                   return (
//                     <React.Fragment key={stockCodeKey}>
//                       {/* Display stock code data */}
//                       <tr>
//                         {columns.map(column => (
//                           columnVisibility[column.id] && (
//                             <td key={column.id}>
//                               {column.id === 'item.stockcodes' && stockCodeData.stockcode}
//                               {column.id === 'stockdescription' && stockCodeData.stockdescription}
//                               {column.id === 'totalQuantity' && stockCodeData.totalQuantity}
//                               {column.id === 'totalCostPrice' && stockCodeData.totalCostPrice}
//                               {column.id === 'totalSelling' && stockCodeData.totalSelling}
//                               {column.id === 'totalGPP' && stockCodeData.totalGPP}
//                               {column.id === 'totalGpValue' && stockCodeData.totalGpValue}
//                             </td>
//                           )
//                         ))}
//                       </tr>
//                     </React.Fragment>
//                   );
//                 })}
//                 {/* Display totals for each department */}
//                 <tr>
//                   <td colSpan={3}>Total Quantity: {row.original.totalQuantity}</td>
//                   <td colSpan={3}>Total Selling: {row.original.totalSelling}</td>
//                   <td colSpan={2}>Total Average Cost Price: {row.original.totalAverageCostPrice}</td>
//                   {/* Add more td elements to display other total information */}
//                 </tr>
//               </React.Fragment>
//             ))}
//           </tbody>

//         </table>
//       </div>
//     </Card>
//   )
// }

// export default ColumnVisibility
