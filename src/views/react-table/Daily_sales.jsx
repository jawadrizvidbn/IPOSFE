'use client' // Add this line to mark the component as a client component

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

import styles from '@core/styles/table.module.css'

import email from '../../../public/Assets/email.png'
import phone from '../../../public/Assets/phone.png'

// Define column helper
const columnHelper = createColumnHelper()

const ColumnVisibility = () => {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [companyDetails, setCompanyDetails] = useState({})
  const containerRef = useRef(null)

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const userDataString = localStorage.getItem('userData')
        const userData = JSON.parse(userDataString)
        const token = userData?.token

        const config = {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwicGVybWlzc2lvbnMiOm51bGwsImlhdCI6MTcxNzIyNTg3MywiZXhwIjoxNzE3MjI5NDczfQ.KiVI44OhrZuf0B9zPYTHlAh3CQRUUO5HsjgvD-VRKAU`
          }
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/greystrstockmaster/tblreg`

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
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = localStorage.getItem('userData')
        const userData = JSON.parse(userDataString)
        const token = userData?.token

        const config = {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwicGVybWlzc2lvbnMiOm51bGwsImlhdCI6MTcxNzI0NDE1NiwiZXhwIjoxNzE3MjQ3NzU2fQ.ry8iOjWTAmG-JAc1nRUmuG2anODn_hwQ-EBk1QMXKOI`
          }
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/victoriastrhistory/202402tbldata_current_tran/DailySalesReport`

        console.log('Fetching data from URL:', apiUrl)
        const response = await axios.get(apiUrl, config)

        const dailySalesData = response.data.daily

        // Define columns dynamically based on the required fields
        const customColumns = [
          columnHelper.accessor('date', {
            id: 'date',
            cell: info => new Date(info.getValue()).toLocaleDateString(),
            header: 'Date'
          }),
          columnHelper.accessor('cash', {
            id: 'cash',
            cell: info => {
              const payment = info.row.original.paymentTypes.find(p => p.paymenttype === 'Cash')

              return payment ? payment.totalInclSelling.toFixed(2) : '0.00'
            },
            header: 'Cash Sales'
          }),
          columnHelper.accessor('card', {
            id: 'card',
            cell: info => {
              const payment = info.row.original.paymentTypes.find(p => p.paymenttype === 'Card')

              return payment ? payment.totalInclSelling.toFixed(2) : '0.00'
            },
            header: 'Card Sales'
          }),
          columnHelper.accessor('d_dep', {
            id: 'd_dep',
            cell: info => {
              const payment = info.row.original.paymentTypes.find(p => p.paymenttype === 'D.Dep')

              return payment ? payment.totalInclSelling.toFixed(2) : '0.00'
            },
            header: 'D.Dep Sales'
          }),
          columnHelper.accessor('acct', {
            id: 'acct',
            cell: info => {
              const payment = info.row.original.paymentTypes.find(p => p.paymenttype === 'Acct')

              return payment ? payment.totalInclSelling.toFixed(2) : '0.00'
            },
            header: 'Acct Sales'
          }),
          columnHelper.accessor('totals.totalExclCost', {
            id: 'totalExclCost',
            cell: info => info.getValue().toFixed(2),
            header: 'Total Excl Cost'
          }),
          columnHelper.accessor('totals.totalInclCost', {
            id: 'totalInclCost',
            cell: info => info.getValue().toFixed(2),
            header: 'Total Incl Cost'
          }),
          columnHelper.accessor('totals.totalExclSelling', {
            id: 'totalExclSelling',
            cell: info => info.getValue().toFixed(2),
            header: 'Total Excl Selling'
          }),
          columnHelper.accessor('totals.totalInclSelling', {
            id: 'totalInclSelling',
            cell: info => info.getValue().toFixed(2),
            header: 'Total Incl Selling'
          }),
          columnHelper.accessor('totals.dayProfit', {
            id: 'dayProfit',
            cell: info => info.getValue().toFixed(2),
            header: 'Day Profit'
          }),
          columnHelper.accessor('totals.totalVAT', {
            id: 'totalVAT',
            cell: info => info.getValue().toFixed(2),
            header: 'Total VAT'
          })
        ]

        // Set columns and default visibility
        setColumns(customColumns)
        const visibility = {}

        customColumns.forEach((column, index) => {
          visibility[column.id] = index < 5 // Show only the first eight columns by default
        })
        setColumnVisibility(visibility)
        setData(dailySalesData)
      } catch (error) {
        console.error('Error fetching or setting sales data:', error)

        if (error.response && error.response.data && error.response.data.message === 'Invalid token') {
          console.log('Invalid token. Clearing localStorage...')
          localStorage.removeItem('userData')
        }
      }
    }

    fetchData()
  }, [])

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

      // Button row ko temporary hide karein
      const buttonRow = container.querySelector('.exclude-from-pdf')

      buttonRow.style.display = 'none'

      const scale = 3

      const canvas = await html2canvas(container, {
        scrollY: -window.scrollY,
        scale,
        useCORS: true
      })

      // Button row ko show karein
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
        const pdfHeightLeftTemp = pdf.addImage(imageData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST')

        pdfHeightLeft -= pdfHeightLeftTemp
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
          title='History Daily Sales'
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

      <div className='d-flex flex-column flex-sm-row mb-3'>
        <div className='mb-2 mb-sm-0'>
          <p className='pe-4'>
            <b>Date From: </b>
            {data.length > 0 && (
              <>
                <span>{formatDate(data[0].date)}</span>
                <b> From Time: </b>
                <span>{formatTime(data[0].date)}</span>
              </>
            )}
          </p>
        </div>
        <div className='mb-2 mb-sm-0'>
          <p className='pe-4'>
            <b>To Date: </b>
            {data.length > 0 && (
              <>
                <span>{formatDate(data[data.length - 1].date)}</span>
                <b> To Time: </b>
                <span>{formatTime(data[data.length - 1].date)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div id='tableContainer' className='overflow-x-auto' ref={containerRef}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default ColumnVisibility

// 'use client'; // Add this line to mark the component as a client component

// import React, { useState, useRef, useEffect } from 'react';

// import Image from 'next/image';

// import Card from '@mui/material/Card';
// import CardHeader from '@mui/material/CardHeader';
// import Select from '@mui/material/Select';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import Button from '@mui/material/Button';
// import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// import axios from 'axios';

// import styles from '@core/styles/table.module.css';
// import email from '../../../public/Assets/email.png';
// import phone from '../../../public/Assets/phone.png';

// const columnHelper = createColumnHelper();

// const ColumnVisibility = () => {
//   const [data, setData] = useState([]);
//   const [columns, setColumns] = useState([]);
//   const [columnVisibility, setColumnVisibility] = useState({});
//   const [companyDetails, setCompanyDetails] = useState({});
//   const containerRef = useRef(null);
//   const [showMenu, setShowMenu] = useState(false);

//   useEffect(() => {
//     const fetchCompanyDetails = async () => {
//       try {
//         const userDataString = localStorage.getItem('userData');
//         const userData = JSON.parse(userDataString);
//         const token = userData?.token;

//         const config = {
//           headers: {
//             Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwicGVybWlzc2lvbnMiOm51bGwsImlhdCI6MTcxNzI1Njk0OCwiZXhwIjoxNzE3MjYwNTQ4fQ.KpH-PkuLRWuV8MHi3qZgqcRThgYnNftVi6SWP1RWtwI`,
//           },
//         };

//         const apiUrl = '${process.env.NEXT_PUBLIC_API_URL}/greystrstockmaster/tblreg';

//         console.log('Fetching company details from URL:', apiUrl);
//         const response = await axios.get(apiUrl, config);

//         if (Array.isArray(response.data) && response.data.length > 0) {
//           setCompanyDetails(response.data[0]);
//         } else {
//           console.error('Empty or invalid response data');
//         }
//       } catch (error) {
//         console.error('Error fetching company data:', error);
//       }
//     };

//     fetchCompanyDetails();
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userDataString = localStorage.getItem('userData');
//         const userData = JSON.parse(userDataString);
//         const token = userData?.token;

//         const config = {
//           headers: {
//             Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwicGVybWlzc2lvbnMiOm51bGwsImlhdCI6MTcxNzI1Njk0OCwiZXhwIjoxNzE3MjYwNTQ4fQ.KpH-PkuLRWuV8MHi3qZgqcRThgYnNftVi6SWP1RWtwI`,
//           },
//         };

//         const apiUrl = '${process.env.NEXT_PUBLIC_API_URL}/victoriastrhistory/202402tbldata_current_tran/DailySalesReport';

//         console.log('Fetching data from URL:', apiUrl);
//         const response = await axios.get(apiUrl, config);

//         const dailySalesData = response.data.daily;

//         const customColumns = [
//           columnHelper.accessor('date', {
//             id: 'date',
//             cell: info => new Date(info.getValue()).toLocaleDateString(),
//             header: 'Date',
//           }),
//           columnHelper.accessor('cash', {
//             id: 'cash',
//             cell: info => {

//               const payment = info.row.original.paymentTypes.find(p => p.paymenttype === 'Cash');

//               return payment ? payment.totalInclSelling.toFixed(2) : '0.00';
//             },
//             header: 'Cash Sales',
//           }),
//           columnHelper.accessor('card', {
//             id: 'card',
//             cell: info => {
//               const payment = info.row.original.paymentTypes.find(p => p.paymenttype === 'Card');

//               return payment ? payment.totalInclSelling.toFixed(2) : '0.00';
//             },
//             header: 'Card Sales',
//           }),
//           columnHelper.accessor('d_dep', {
//             id: 'd_dep',
//             cell: info => {
//               const payment = info.row.original.paymentTypes.find(p => p.paymenttype === 'D.Dep');

//               return payment ? payment.totalInclSelling.toFixed(2) : '0.00';
//             },
//             header: 'D.Dep Sales',
//           }),
//           columnHelper.accessor('acct', {
//             id: 'acct',
//             cell: info => {
//               const payment = info.row.original.paymentTypes.find(p => p.paymenttype === 'Acct');

//               return payment ? payment.totalInclSelling.toFixed(2) : '0.00';
//             },
//             header: 'Acct Sales',
//           }),
//           columnHelper.accessor('totals.totalExclCost', {
//             id: 'totalExclCost',
//             cell: info => info.getValue().toFixed(2),
//             header: 'Total Excl Cost',
//           }),
//           columnHelper.accessor('totals.totalInclCost', {
//             id: 'totalInclCost',
//             cell: info => info.getValue().toFixed(2),
//             header: 'Total Incl Cost',
//           }),
//           columnHelper.accessor('totals.totalExclSelling', {
//             id: 'totalExclSelling',
//             cell: info => info.getValue().toFixed(2),
//             header: 'Total Excl Selling',
//           }),
//           columnHelper.accessor('totals.totalInclSelling', {
//             id: 'totalInclSelling',
//             cell: info => info.getValue().toFixed(2),
//             header: 'Total Incl Selling',
//           }),
//           columnHelper.accessor('totals.dayProfit', {
//             id: 'dayProfit',
//             cell: info => info.getValue().toFixed(2),
//             header: 'Day Profit',
//           }),
//           columnHelper.accessor('totals.totalVAT', {
//             id: 'totalVAT',
//             cell: info => info.getValue().toFixed(2),
//             header: 'Total VAT',
//           }),
//         ];

//         setColumns(customColumns);
//         const visibility = {};

//         customColumns.forEach((column, index) => {

//           visibility[column.id] = index < 5; // Show only the first five columns by default
//         });
//         setColumnVisibility(visibility);
//         setData(dailySalesData);
//       } catch (error) {
//         console.error('Error fetching or setting sales data:', error);

//         if (error.response && error.response.data && error.response.data.message === 'Invalid token') {
//           console.log('Invalid token. Clearing localStorage...');
//           localStorage.removeItem('userData');
//         }
//       }
//     };

//     fetchData();
//   }, []);

//   const handleColumnVisibilityChange = columnId => {
//     setColumnVisibility(prevVisibility => ({
//       ...prevVisibility,
//       [columnId]: !prevVisibility[columnId],
//     }));
//   };

//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       columnVisibility,
//     },
//     onColumnVisibilityChange: setColumnVisibility,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   const generatePDF = async () => {
//     try {
//       const container = containerRef.current;

//       const buttonRow = container.querySelector('.exclude-from-pdf');

//       buttonRow.style.display = 'none';

//       const scale = 3;

//       const canvas = await html2canvas(container, {
//         scrollY: -window.scrollY,
//         scale,
//         useCORS: true,
//       });

//       buttonRow.style.display = 'flex';

//       const imageData = canvas.toDataURL('image/jpeg', 1.0);
//       const containerWidth = container.offsetWidth;
//       const containerHeight = container.offsetHeight;
//       const ratio = containerWidth / containerHeight;
//       const pdfWidth = 210;
//       const pdfHeight = pdfWidth / ratio;
//       const pdf = new jsPDF('p', 'mm', 'a4');

//       let pdfHeightLeft = pdfHeight;
//       let position = 0;

//       while (pdfHeightLeft > 0) {
//         pdf.addImage(imageData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
//         pdfHeightLeft -= pdfHeight;
//         position -= pdfHeight;

//         if (pdfHeightLeft > 0) {
//           pdf.addPage();
//         }
//       }

//       pdf.save('GreystrHistory_April_Daily_sales_Report.pdf');
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//     }
//   };

//   const formatDate = dateString => {
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };

//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const formatTime = dateString => {
//     const options = { hour: '2-digit', minute: '2-digit' };

//     return new Date(dateString).toLocaleTimeString(undefined, options);
//   };

//   return (
//     <Card ref={containerRef}>
//       <div className='flex justify-center'>
//         <CardHeader
//           title='History Daily Sales'
//           className='gap-2 flex-col items-start sm:flex-row sm:items-center text-center'
//           titleTypographyProps={{
//             style: {
//               margin: 0,
//               fontFamily: '__Inter_10a487',
//               fontWeight: 700,
//               fontSize: '2.125rem',
//               lineHeight: 4.5556,
//               color: 'rgb(92 71 129 / 90%)',
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
//         <h4 className='font-semibold text-left'>{companyDetails?.Company}</h4>
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
//           <Button className='btn btn-secondary mr-2' variant='contained'>
//             Copy
//           </Button>
//           <Button className='btn btn-secondary mr-2' variant='contained'>
//             CSV
//           </Button>
//           <Button className='btn btn-secondary mr-2' variant='contained'>
//             Excel
//           </Button>
//           <Button className='btn btn-secondary mr-2' variant='contained' onClick={generatePDF}>
//             PDF
//           </Button>
//           <Button className='btn btn-secondary' variant='contained'>
//             Print
//           </Button>
//           <div className="relative inline-block text-center">
//   <div>
//     <button
//       type="button"
//       className="inline-flex justify-center w-full rounded-md border border-gray-300 bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
//       id="dropdown-menu"
//       aria-haspopup="true"
//       aria-expanded="true"
//       onClick={() => setShowMenu(!showMenu)}
//       style={{ backgroundColor: '#8c57ff', color: '#ffffff' }} // Set background color to #8c57ff and text color to #ffffff
//     >
//       Visible Columns
//       <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//         <path fillRule="evenodd" d="M9.293 5.293a1 1 0 011.414 0L12 7.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414zM4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
//       </svg>
//     </button>
//   </div>

//   {showMenu && (
//     <div
//       className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
//       role="menu"
//       aria-orientation="vertical"
//       aria-labelledby="dropdown-menu"
//     >
//       <div className="py-1" role="none">
//         {columns.map(column => (
//           <button
//             key={column.id}
//             onClick={() => handleColumnVisibilityChange(column.id)}
//             className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-left"
//             role="menuitem"
//             style={{ backgroundColor: '#8c57ff', color: '#ffffff' }} // Set background color to #8c57ff and text color to #ffffff
//           >
//             {column.header}
//           </button>
//         ))}
//       </div>
//     </div>
//   )}
// </div>

//         </div>
//       </div>

//       <div className='flex justify-center'>
//         <div className='flex flex-col sm:flex-row space-x-4 mb-3'>
//           <div className='mb-2 sm:mb-0'>
//             <p className='text-center sm:text-left'>
//               <b>Date From: </b>
//               {data.length > 0 && (
//                 <>
//                   <span>{formatDate(data[0].date)}</span>
//                   <b> From Time: </b>
//                   <span>{formatTime(data[0].date)}</span>
//                 </>
//               )}
//             </p>
//           </div>
//           <div className='mb-2 sm:mb-0'>
//             <p className='text-center sm:text-left'>
//               <b>To Date: </b>
//               {data.length > 0 && (
//                 <>
//                   <span>{formatDate(data[data.length - 1].date)}</span>
//                   <b> To Time: </b>
//                   <span>{formatTime(data[data.length - 1].date)}</span>
//                 </>
//               )}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div id='tableContainer' className='overflow-x-auto text-center' ref={containerRef}>
//         <table className={styles.table}>
//           <thead className='text-wrap'>
//             {table.getHeaderGroups().map(headerGroup => (
//               <tr key={headerGroup.id}>
//                 {headerGroup.headers.map(header => (
//                   <th key={header.id} className='p-2'>
//                     <div className='break-all'>
//                       {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table.getRowModel().rows.map(row => (
//               <tr key={row.id}>
//                 {row.getVisibleCells().map(cell => (
//                   <td key={cell.id} className='p-2'>
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </Card>
//   );
// };

// export default ColumnVisibility;
