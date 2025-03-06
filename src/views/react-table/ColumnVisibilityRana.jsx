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

const ColumnVisibilityRana = () => {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [companyDetails, setCompanyDetails] = useState({})
  const containerRef = useRef(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = session?.user?.id ? `Bearer ${session.user.id}` : ''

        const config = {
          headers: {
            Authorization: token
          }
        }

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
  }, [session.user.id])

  useEffect(() => {
    const fetchData = async () => {
      try {
             const token = session?.user?.id ? `Bearer ${session.user.id}` : ''

        const config = {
          headers: {
            Authorization: token
          }
        }

        const apiUrl =
          '${process.env.NEXT_PUBLIC_API_URL}/crownhistory/departmentsSalesReports/202309tbldata_current_tran'

        const response = await axios.get(apiUrl, config)

        const history_item_sale = response?.data?.formattedStockCodes

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
  }, [session.user.id])

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
              table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
          </thead>
          {/* <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  const cellValue = cell.column.columnDef.cell(cell.getContext()); // Retrieving the cell value

                  console.log(`key = ${cell.id} > ${cellValue}`);
                  console.log("Cell object:", cell.row.original); // Log the entire cell object for debugging

                  return (
                    <td key={cell.id}>
                      {flexRender(cellValue, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody> */}

          {/* <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  const cellValue = cell.column.columnDef.cell(cell.getContext()); // Retrieving the cell value

                  console.log(`Cell (${row.id}, ${cell.id}):`, cellValue); // Log cell value along with row and cell IDs
                  console.log("Row object:", row.original); // Log the entire row object for debugging
                  console.log("Cell object:", cell); // Log the entire cell object for debugging

                  return (
                    <td key={cell.id}>
                      {flexRender(cellValue, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody> */}
        </table>
      </div>
    </Card>
  )
}

export default ColumnVisibilityRana
