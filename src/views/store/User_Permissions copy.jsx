/* eslint-disable react-hooks/exhaustive-deps */
// 'use client'

// import React, { useEffect, useState } from 'react'

// import { useRouter, useSearchParams } from 'next/navigation'

// import { useSession } from 'next-auth/react'
// import axios from 'axios'

// const AllusersUpdate = () => {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { data: session } = useSession()
//   const [userData, setUserData] = useState({})
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [shops, setShops] = useState([])
//   const [tables, setTables] = useState([])
//   const [shopFields, setShopFields] = useState([{ shopName: '', group: '' }])
//   const [selectedGroup, setSelectedGroup] = useState('')
//   const [selectedTables, setSelectedTables] = useState([])
//   const [successMessage, setSuccessMessage] = useState('')
//   const [allShops, setAllShops] = useState([])
//   const userQuery = searchParams.get('user')

//   useEffect(() => {
//     if (userQuery) {
//       try {
//         const user = JSON.parse(userQuery)

//         setUserData(user)
//       } catch (error) {
//         console.error('Error parsing user data:', error)
//         setError('Error parsing user data')
//       }
//     }
//   }, [userQuery])

//   useEffect(() => {
//     if (session && userData.id) {
//       fetchShops()
//       fetchShopAccess()
//     }
//   }, [session, userData.id])

//   useEffect(() => {
//     const initialSelectedTables = tables.flatMap(db =>
//       db.tables.filter(table => table.access).map(table => table.tableName)
//     );
//     setSelectedTables(initialSelectedTables);
//   }, [tables]);
//   const fetchShops = async () => {
//     try {
//       const token = session?.user?.id

//       if (!token) throw new Error('Token not available')

//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/auth/users/getUserGroupsAndShops/${userData.id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       )

//       let shopsArray = []

//       if (Array.isArray(response.data)) {
//         shopsArray = response.data
//       } else if (typeof response.data === 'object' && response.data !== null) {
//         shopsArray = Object.entries(response.data).map(([key, value]) => ({
//           group: key,
//           shopName: key,
//           ...value
//         }))
//       } else {
//         throw new Error('Unexpected data format')
//       }

//       setShops(shopsArray)
//     } catch (error) {
//       console.error('Error fetching shops:', error.response ? error.response.data : error.message)
//       setError(error.response ? error.response.data.message : 'Error fetching shops')
//     }
//   }

//   const fetchTables = async group => {
//     try {
//       const token = session?.user?.id

//       if (!token) throw new Error('Token not available')

//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${userData.id}/groups/${group}/tables`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       )

//       if (Array.isArray(response.data)) {
//         setTables(response.data)
//       } else {
//         throw new Error('Unexpected data format')
//       }
//     } catch (error) {
//       console.error('Error fetching tables:', error.response ? error.response.data : error.message)
//       setError(error.response ? error.response.data.message : 'Error fetching tables')
//     }
//   }
//   const fetchShopAccess = async () => {
//     try {
//       const token = session?.user?.id
//       if (!token) throw new Error('Token not available')

//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${userData.id}/shop-access`,
//           {
//             headers: { Authorization: `Bearer ${token}` }
//           }
//         )

//       // Assuming response.data.user.permissions is the correct format
//       setAllShops(response.data.user.permissions)
//     } catch (error) {
//       console.error('Error fetching shop access:', error.response ? error.response.data : error.message)
//       setError(error.response ? error.response.data.message : 'Error fetching shop access')
//     }
//   }

//   const handleGroupChange = (event, index) => {
//     const selectedGroupId = event.target.value;
//     const selectedShop = shops.find(shop => shop.group === selectedGroupId);

//     setShopFields(prevFields =>
//       prevFields.map((field, i) => i === index ? { ...field, group: selectedGroupId, shopName: selectedShop ? selectedShop.shopName : '' }: field));
//     setSelectedGroup(selectedGroupId);
//     fetchTables(selectedGroupId);
//   };

//   const handleUpdate = async event => {
//     event.preventDefault();
//     setLoading(true);
//     setSuccessMessage(''); // Clear any previous success message

//     try {
//       const token = session?.user?.id;
//       if (!token) throw new Error('Token not available');

//       // Create the permissions array for the selected group only
//       const permissions = [{
//         group: selectedGroup || '', // Use selectedGroup or default to 'app'
//         shopName: shops.find(shop => shop.group === selectedGroup)?.shopName || '',
//         tables: selectedTables.map(tableName => ({
//           tableName: tableName,
//           access: true
//         }))
//       }];
//       const updatedUserData = {
//         ...userData,
//         permissions: permissions.length > 0 ? permissions : [{ group: '', shopName: '', tables: [] }]
//       };

//       const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${userData.id}/groups`;

//       const response = await axios.put(apiUrl, updatedUserData, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       if (response.data) {
//         setUserData(response.data);
//         setSuccessMessage('User data updated successfully!'); // Set success message
//         router.push('/en/apps/user/list');
//       } else {
//         throw new Error('Updated user data not found in response');
//       }
//     } catch (error) {
//       console.error('Error updating user data:', error);
//       const errorMessage = error.response?.data?.message || error.message;
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleChange = (event, index) => {
//     const { name, value } = event.target

//     setShopFields(prevFields => {
//       const updatedFields = [...prevFields]

//       updatedFields[index] = { ...updatedFields[index], [name]: value }

//       return updatedFields
//     })
//   }

//   const handleCheckboxChange = tableName => {
//     setSelectedTables(prevSelectedTables =>
//       prevSelectedTables.includes(tableName)
//         ? prevSelectedTables.filter(name => name !== tableName)
//         : [...prevSelectedTables, tableName]
//     )
//   }

//   if (loading) {
//     return <p className='text-gray-500'>Loading...</p>
//   }

//   if (error) {
//     return <p className='text-red-500'>Error: {String(error)}</p>
//   }

//   return (
//     <div className='max-w-7xl mx-auto p-6 bg-white shadow-md rounded-lg'>
//       <div>
//         {successMessage && <div className='text-green-500'>{successMessage}</div>}
//         {/* Your form and other components */}
//       </div>

//       <h1 className='text-2xl font-bold mb-4'>User Details for ID: {userData.id}</h1>
//       <form onSubmit={handleUpdate} className='space-y-4'>
//         <label className='block'>
//           <span className='text-gray-700'>Name:</span>
//           <input
//             type='text'
//             name='name'
//             value={userData.name || ''}
//             onChange={event => setUserData({ ...userData, name: event.target.value })}
//             className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
//           />
//         </label>
//         <label className='block'>
//           <span className='text-gray-700'>Email:</span>
//           <input
//             type='email'
//             name='email'
//             value={userData.email || ''}
//             onChange={event => setUserData({ ...userData, email: event.target.value })}
//             className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
//           />
//         </label>
//         <label className='block'>
//           <span className='text-gray-700'>Role:</span>
//           <input
//             type='text'
//             name='role'
//             value={userData.role || ''}
//             onChange={event => setUserData({ ...userData, role: event.target.value })}
//             className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
//           />
//         </label>

//         {shopFields.map((field, index) => (
//           <div key={index}>
//             <label className='block'>
//               <span className='text-gray-700'>Select Shop:</span>
//               <select
//                 name='group'
//                 value={field.group}
//                 onChange={event => handleGroupChange(event, index)}
//                 className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
//               >
//                 <option value=''>Select a shop</option>
//                 {shops.map((shop, i) => (
//                   <option key={i} value={shop.group}>
//                     {shop.shopName}
//                   </option>
//                 ))}
//               </select>
//             </label>
//             <label className='block'>
//               <span className='text-gray-700'>Group:</span>
//               <input
//                 type='text'
//                 name='group'
//                 value={field.group}
//                 onChange={event => handleChange(event, index)}
//                 className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
//               />
//             </label>
//           </div>
//         ))}

//         <h2 className='text-xl font-semibold mt-6 mb-2'>Tables for Selected Group:</h2>
//         <table className='min-w-full divide-y divide-gray-200'>
//           <thead className='bg-gray-50'>
//             <tr>
//               <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Select</th>
//               <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
//                 Database Name
//               </th>
//               <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
//                 Table Name
//               </th>
//             </tr>
//           </thead>
//           <tbody className='bg-white divide-y divide-gray-200'>
//             {tables.map((db, dbIndex) => (
//               <React.Fragment key={dbIndex}>
//                 <tr>
//                   <td colSpan='3' className='px-6 py-4 text-sm font-semibold text-gray-900 bg-gray-100 uppercase'>
//                     Database Name: {db.database || `Database ${dbIndex}`}
//                   </td>
//                 </tr>

//                 {db.tables
//                   .reduce((rows, table, index) => {
//                     if (index % 3 === 0) {
//                       rows.push([])
//                     }

//                     rows[rows.length - 1].push(table)

//                     return rows
//                   }, [])
//                   .map((tableGroup, groupIndex) => (
//                     <tr key={`${dbIndex}-${groupIndex}`} className='border-t'>
//                       {tableGroup.map((table, tableIndex) => (
//                         <td key={tableIndex} className='px-6 py-4 text-sm font-medium text-gray-900'>
//                           <label className='inline-flex items-center'>
//                             <input
//                               type='checkbox'
//                               name='tableSelect'
//                               value={table.tableName}
//                               checked={selectedTables.includes(table.tableName)}
//                               onChange={() => handleCheckboxChange(table.tableName)}
//                               className='form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out'
//                             />
//                             <span className='ml-2'>{table.tableName || 'No Table Name'}</span>
//                           </label>
//                         </td>
//                       ))}
//                       {3 - tableGroup.length > 0 &&
//                         Array.from({ length: 3 - tableGroup.length }).map((_, emptyCellIndex) => (
//                           <td key={emptyCellIndex} className='px-6 py-4 text-sm text-gray-500'>
//                             {/* Empty cell */}
//                           </td>
//                         ))}
//                     </tr>
//                   ))}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//         <button
//           type='submit'
//           className='px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
//         >
//           Update User
//         </button>
//       </form>
//     </div>
//   )
// }

// export default AllusersUpdate

'use client'

import React, { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { useSession } from 'next-auth/react'
import axios from 'axios'

const AllusersUpdate = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shops, setShops] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [staticReportPermissions, setStaticReportPermissions] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [allShops, setAllShops] = useState([])
  const [selectedReportIndex, setSelectedReportIndex] = useState(null)
  const [reportOptions, setReportOptions] = useState([])
  const [permissionsState, setPermissionsState] = useState({})
  const [toggleState, setToggleState] = useState(false) // Define toggleState

  const userQuery = searchParams.get('user')

  useEffect(() => {
    if (userQuery) {
      try {
        const user = JSON.parse(userQuery)

        setUserData(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setError('Error parsing user data')
      }
    }
  }, [userQuery])

  useEffect(() => {
    if (session && userData.id) {
      fetchShops()
      fetchShopAccess()
    }
  }, [fetchShopAccess, fetchShops, session, userData.id])

  useEffect(() => {
    if (staticReportPermissions.data) {
      const options = staticReportPermissions.data.map((report, index) => ({
        index,
        label: report.fieldName || `Report ${index + 1}`
      }))

      setReportOptions(options)

      const initialPermissionsState = {}

      staticReportPermissions.data.forEach((report, index) => {
        Object.entries(report).forEach(([field, access]) => {
          if (typeof access === 'boolean') {
            initialPermissionsState[`${index}-${field}`] = access
          }
        })
      })
      setPermissionsState(initialPermissionsState)
    }
  }, [staticReportPermissions])

  const fetchShops = async () => {
    try {
      const token = session?.user?.id

      if (!token) throw new Error('Token not available')

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/getUserGroupsAndShops/${userData.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      let shopsArray = []

      if (Array.isArray(response.data)) {
        shopsArray = response.data
      } else if (typeof response.data === 'object' && response.data !== null) {
        shopsArray = Object.entries(response.data).map(([key, value]) => ({
          group: key,
          shopName: key,
          ...value
        }))
      } else {
        throw new Error('Unexpected data format')
      }

      setShops(shopsArray)
    } catch (error) {
      console.error('Error fetching shops:', error.response ? error.response.data : error.message)
      setError(error.response ? error.response.data.message : 'Error fetching shops')
    }
  }

  const fetchShopAccess = async () => {
    try {
      const token = session?.user?.id

      if (!token) throw new Error('Token not available')

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/${userData.id}/shop-access`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.permissions) {
        setAllShops(response.data.permissions)
        const firstGroup = response.data.permissions.find(permission => permission.group)

        if (firstGroup) {
          setStaticReportPermissions(firstGroup.staticReportPermissions || {})
          setSelectedGroup(firstGroup.group)
        }
      } else {
        throw new Error('Unexpected data format')
      }
    } catch (error) {
      console.error('Error fetching shop access:', error.response ? error.response.data : error.message)
      setError(error.response ? error.response.data.message : 'Error fetching shop access')
    }
  }

  const handleGroupChange = event => {
    const selectedGroupId = event.target.value

    setSelectedGroup(selectedGroupId)
    const selectedPermissions = allShops.find(shop => shop.group === selectedGroupId)?.staticReportPermissions || {}

    setStaticReportPermissions(selectedPermissions)
    setSelectedReportIndex(null) // Reset the selected report when group changes
  }

  const handleReportChange = event => {
    const reportIndex = parseInt(event.target.value, 10)

    setSelectedReportIndex(reportIndex)
  }

  const handleStaticReportPermissionChange = (index, field, access) => {
    setPermissionsState(prev => ({
      ...prev,
      [`${index}-${field}`]: access
    }))
  }

  const handleUpdate = async event => {
    event.preventDefault()
    setLoading(true)
    setSuccessMessage('')
    setError(null)

    try {
      const token = session?.user?.id

      if (!token) throw new Error('Token not available')

      const updateNestedPermissions = (permissions, state, prefix = '') => {
        return Object.keys(permissions).reduce((acc, key) => {
          const fullKey = prefix ? `${prefix}-${key}` : key

          if (typeof permissions[key] === 'boolean') {
            acc[key] = state[fullKey] !== undefined ? state[fullKey] : permissions[key]
          } else if (Array.isArray(permissions[key])) {
            acc[key] = permissions[key].map((item, index) =>
              updateNestedPermissions(item, state, `${fullKey}[${index}]`)
            )
          } else if (typeof permissions[key] === 'object') {
            acc[key] = updateNestedPermissions(permissions[key], state, fullKey)
          }

          return acc
        }, {})
      }

      // Find the current permissions for the selected group
      const currentPermissions = allShops.find(shop => shop.group === selectedGroup)?.staticReportPermissions || {}

      // If a specific report is selected, update its permissions
      const updatedPermissions = staticReportPermissions.data.map((report, index) => {
        if (index === selectedReportIndex) {
          return updateNestedPermissions(report, permissionsState)
        }

        return report // Keep other reports unchanged
      })

      const permissions = [
        {
          group: selectedGroup || '',
          shopName: shops.find(shop => shop.group === selectedGroup)?.shopName || '',
          staticReportPermissions: updatedPermissions
        }
      ]

      const updatedUserData = {
        ...userData,
        permissions
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${userData.id}/groups`

      const response = await axios.put(apiUrl, updatedUserData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data) {
        setUserData(response.data)
        setSuccessMessage('User data updated successfully!')
        router.push('/en/apps/user/list')
      } else {
        throw new Error('Updated user data not found in response')
      }
    } catch (error) {
      console.error('Error updating user data:', error)
      const errorMessage = error.response?.data?.message || error.message

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderStaticReportPermissionsTable = () => {
    if (!staticReportPermissions.data || selectedReportIndex === null) return null

    const report = staticReportPermissions.data[selectedReportIndex] || {}

    const cleanFieldName = field => field.replace(/^0\./, '')

    const renderRow = (field, access) => (
      <tr key={field} className='bg-white'>
        <td className='border px-4 py-2'>{cleanFieldName(field)}</td>
        <td className='border px-4 py-2'>
          <input
            type='checkbox'
            checked={permissionsState[`${selectedReportIndex}-${field}`] || false}
            onChange={e => handleStaticReportPermissionChange(selectedReportIndex, field, e.target.checked)}
            className='form-checkbox h-4 w-4 text-blue-600'
          />
        </td>
      </tr>
    )

    const renderSection = (section, sectionName) => {
      return (
        <React.Fragment key={sectionName}>
          <tr className='bg-gray-100'>
            <td colSpan='2' className='border px-4 py-2 font-bold'>
              {sectionName}
            </td>
          </tr>
          {Object.entries(section).flatMap(([field, value]) => {
            if (Array.isArray(value)) {
              return value.flatMap((item, subIndex) =>
                Object.entries(item).map(([nestedField, nestedValue]) =>
                  renderRow(`${field}[${subIndex}].${nestedField}`, nestedValue.access)
                )
              )
            }

            if (typeof value === 'object') {
              return Object.entries(value).map(([nestedField, nestedValue]) =>
                renderRow(`${field}.${nestedField}`, nestedValue.access)
              )
            }

            if (typeof value === 'boolean') {
              return [renderRow(field, value)]
            }

            return []
          })}
        </React.Fragment>
      )
    }

    return (
      <table className='min-w-full divide-y divide-gray-200 bg-white border border-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Field Name
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Access</th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {Object.entries(report).flatMap(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return renderSection(value, key)
            }

            return renderRow(key, value)
          })}
        </tbody>
      </table>
    )
  }

  const handleToggle = () => {
    setToggleState(prevState => !prevState)
  }

  return (
    <div className='container mx-auto p-4'>
      <form onSubmit={handleUpdate} className='space-y-4'>
        {error && <div className='text-red-600'>{error}</div>}
        {successMessage && <div className='text-green-600'>{successMessage}</div>}

        <div>
          <label className='block'>
            <span className='text-gray-700'>Email:</span>
            <input
              type='email'
              name='email'
              value={userData.email || ''}
              onChange={event => setUserData({ ...userData, email: event.target.value })}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              required
            />
          </label>
        </div>

        <div>
          <label className='block'>
            <span className='text-gray-700'>Select Group:</span>
            <select
              value={selectedGroup}
              onChange={handleGroupChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            >
              <option value=''>Select a group</option>
              {shops.map(shop => (
                <option key={shop.group} value={shop.group}>
                  {shop.shopName || shop.group}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className='block'>
            <span className='text-gray-700'>Select Report:</span>
            <select
              value={selectedReportIndex ?? ''}
              onChange={handleReportChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            >
              <option value=''>Select a report</option>
              {reportOptions.map(option => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <button
            type='button'
            onClick={handleToggle}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
              toggleState ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            } hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {toggleState ? 'True' : 'False'}
          </button>
        </div>

        {renderStaticReportPermissionsTable()}

        <button
          type='submit'
          disabled={loading}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  )
}

export default AllusersUpdate
