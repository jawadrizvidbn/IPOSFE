// 'use client'

// // React Imports
// import { useState, useEffect } from 'react'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'

// // Third-party Imports
// import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
// import axios from 'axios' // Import Axios for HTTP requests

// // Style Imports
// import styles from '@core/styles/table.module.css'

// // Data Imports

// // Removed defaultData as we'll fetch data from the API

// // Column Definitions
// const columnHelper = createColumnHelper()

// const columns = [

//   columnHelper.accessor('Name', {
//     cell: info => info.getValue(),
//     header: 'Name'
//   })
// ]

// const BasicDataTables = () => {
//   // States
//   const [data, setData] = useState([])
//   const [isLoading, setIsLoading] = useState(false) // Track loading state
//   const [error, setError] = useState(null) // Track error state

//   // Fetch data from API using useEffect with a dependency array
//   // to refetch on user data changes (optional)
//   useEffect(
//     () => {
//       const fetchData = async () => {
//         setIsLoading(true)
//         setError(null)

//         try {
//           // Prepare the API request configuration with optional headers
//           const userDataString = localStorage.getItem('userData')
//           const userData = JSON.parse(userDataString)
//           const token = userData?.token

//           const config = {
//             headers: {
//               Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwicGVybWlzc2lvbnMiOm51bGwsImlhdCI6MTcxNzUxODc4MSwiZXhwIjoxNzE3NjA1MTgxfQ.g4v_RrErGv_SjuANoNwjdneMCptxOymW950CnLcC_Sc`
//             }
//           }

//           const apiUrl = '${process.env.NEXT_PUBLIC_API_URL}/greystrhistory/allTblDataCurrentTran' // Replace with your actual URL

//           console.log('Fetching data from:', apiUrl)

//           const response = await axios.get(apiUrl, config)

//           const history_item_sale = response.data

//           console.log('Fetched data:', history_item_sale) // Consider removing unnecessary logs in production

//           setData(history_item_sale)
//         } catch (error) {
//           console.error('Error fetching data:', error)

//           // Handle specific error scenarios (e.g., invalid token)
//           if (error.response && error.response.data && error.response.data.message === 'Invalid token') {
//             console.log('Invalid token. Clearing localStorage...')
//             localStorage.removeItem('userData')
//           }
//         } finally {
//           setIsLoading(false)
//         }
//       }

//       fetchData()
//     },
//     [
//       /* Optional dependency array for user data changes */
//     ]
//   )

//   // Hooks
//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     filterFns: {
//       fuzzy: () => false
//     }
//   })

//   return (
//     <Card>
//       <CardHeader title='Basic Table' />
//       {isLoading ? (
//         <div>Loading data...</div>
//       ) : error ? (
//         <div>Error: {error.message}</div>
//       ) : (
//         <div className='overflow-x-auto'>
//         <table className={styles.table}>
//           <thead>
//             {table &&
//               table.getHeaderGroups().map(headerGroup => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map(header => (
//                     <th key={header.id}>
//                       {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//           </thead>
//           <tbody>
//             {table.getRowModel().rows.map(row => (
//               <tr key={row.id}>
//                 {row.getVisibleCells().map(cell => (
//                   <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         </div>
//       )}
//     </Card>
//   )
// }

// export default BasicDataTables

'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios' // Import Axios for HTTP requests

// Style Imports
import { signOut, useSession } from 'next-auth/react'

import styles from '@core/styles/table.module.css'
import { getLocalizedUrl } from '@/utils/i18n'

// Data Imports

// Removed defaultData as we'll fetch data from the API

// Column Definitions
const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('Name', {
    cell: info => info.getValue(),
    header: 'Name'
  })
]

const BasicDataTables = () => {
  // States
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false) // Track loading state
  const [error, setError] = useState(null)
  const { data: session } = useSession() // Track error state

  // Fetch data from API using useEffect with a dependency array
  // to refetch on user data changes (optional)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!session || !session.user || !session.user.token) {
          console.error('Session data not available')

          return
        }

        const token = session?.user?.id ? `Bearer ${session.user.token}` : ''
        const config = { headers: { Authorization: token } }

        const apiUrl = '${process.env.NEXT_PUBLIC_API_URL}/greystrhistory/allTblDataCurrentTran' // Replace with your actual URL

        console.log('Fetching data from:', apiUrl)

        const response = await axios.get(apiUrl, config)

        const history_item_sale = response.data

        console.log('Fetched data:', history_item_sale) // Consider removing unnecessary logs in production

        setData(history_item_sale)
      } catch (error) {
        if (error?.response?.status === 401) {
          signOut({ redirect: false })
          router.push(getLocalizedUrl('/login', 'en'))

          return
        } else {
          console.error('Error fetching data:', error)

          // Handle specific error scenarios (e.g., invalid token)
          if (error.response && error.response.data && error.response.data.message === 'Invalid token') {
            console.log('Invalid token. Clearing localStorage...')
            localStorage.removeItem('userData')
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

  // Hooks
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

  return (
    <Card>
      <CardHeader title='Basic Table' />
      {isLoading ? (
        <div>Loading data...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <div className='overflow-x-auto'>
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
      )}
    </Card>
  )
}

export default BasicDataTables
