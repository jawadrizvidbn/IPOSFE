'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Card, CardHeader } from '@mui/material'
import axios from 'axios'
import { useSession, signOut } from 'next-auth/react'
import { useReactTable, createColumnHelper, flexRender, getCoreRowModel } from '@tanstack/react-table'
import { useSelector } from 'react-redux'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('name', {
    cell: info => info.row.original.name,
    header: 'Name'
  }),
  columnHelper.accessor('email', {
    cell: info => info.row.original.email,
    header: 'Email'
  })
]

const AllDataCashupSalesRecords = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const shopKey = useSelector(state => state.shopKey) // Fetch shopKey from Redux store

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!session || !session.user || !session.user.id) {
          throw new Error('Session data not available')
        }

        const token = `Bearer ${session.user.id}`
        const config = { headers: { Authorization: token } }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/users`

        const response = await axios.get(apiUrl, {
          headers: config.headers
        })

        setData(response.data)
        setFilteredData(response.data) // Initialize filtered data with the fetched data
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error)

        if (error.response && error.response.status === 401) {
          // Clear session and redirect to login
          await signOut({ redirect: false })
          router.push('/login')
        } else {
          setError(error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, router])

  const table = useReactTable({
    data: searchTerm ? filteredData : data, // Use filteredData if searchTerm exists
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

  const handleSearchChange = event => {
    const searchTerm = event.target.value

    setSearchTerm(searchTerm)

    // Filter data based on search term
    const filtered = data.filter(
      item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredData(filtered)
  }

  return (
    <Card className='p-4'>
      <CardHeader title={`All Users`} />

      <div className='mb-4 flex justify-end'>
        <input
          type='text'
          placeholder='Search...'
          className='border border-gray-300 rounded-md px-2 py-2 h-10 focus:border-blue-500 focus:outline-none'
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {isLoading ? (
        <div className='loading text-center py-4'>Loading data...</div>
      ) : error ? (
        <div className='error text-center text-red-500 py-4'>Error: {error.message}</div>
      ) : (
        <div className=''>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(
                    header =>
                      header.id !== 'email' && (
                        <th
                          key={header.id}
                          className=' py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      )
                  )}
                  <th className=' py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              ))}
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'>
              {table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} className='hover:bg-gray-100'>
                  <td className=' py-4 whitespace-nowrap'>
                    <span className='text-gray-500'>{index + 1}.</span>{' '}
                    <Link href={{ pathname: '/en/apps/user/allusersupdate/', query: { id: row.original.id } }} passHref>
                      <span className='cursor-pointer text-black hover:text-blue-700'>{row.original.name}</span>
                    </Link>
                    <br />
                    <span className='text-gray-500'>{row.original.email}</span>
                  </td>
                  <td className=' py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <Link
                      href={{
                        pathname: '/en/apps/user/allusersupdate/',
                        query: {
                          user: JSON.stringify({
                            id: row.original.id,
                            name: row.original.name,
                            email: row.original.email,
                            role: row.original.role,
                            image: row.original.image,
                            plan: row.original.plan,
                            planActive: row.original.planActive,
                            planStartDate: row.original.planStartDate,
                            planEndDate: row.original.planEndDate
                            // eslint-disable-next-line lines-around-comment
                            // Add other fields you want to pass
                          })
                        }
                      }}
                      passHref
                    >
                      <p className='text-blue-600 hover:text-blue-900'>Edit</p>
                    </Link>
                    <Link
                      href={{
                        pathname: '/en/apps/user/user_permissions/',
                        query: {
                          user: JSON.stringify({
                            id: row.original.id,
                            name: row.original.name,
                            email: row.original.email,
                            role: row.original.role,
                            image: row.original.image

                            // Add other fields you want to pass
                          })
                        }
                      }}
                      passHref
                    >
                      <p className='text-blue-600 hover:text-blue-900'>Permission</p>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default AllDataCashupSalesRecords
