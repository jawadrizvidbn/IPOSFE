/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState, useMemo } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { signOut, useSession } from 'next-auth/react'
import axios from 'axios'
import set from 'lodash.set'

import { getLocalizedUrl } from '@/utils/i18n'

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
  }, [session, userData.id])

  useEffect(() => {
    if (staticReportPermissions.data) {
      const options = staticReportPermissions.data.map((report, index) => ({
        index,
        label: report.fieldName || `Report ${index + 1}`
      }))

      setReportOptions(options)
      setPermissionsState(
        staticReportPermissions.data.reduce((acc, report, index) => {
          acc[index] = report

          return acc
        }, {})
      )
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

      const shopsArray = Array.isArray(response.data)
        ? response.data
        : Object.entries(response.data).map(([key, value]) => ({
            group: key,
            shopName: key,
            ...value
          }))

      setShops(shopsArray)
    } catch (error) {
      if (error?.response?.status === 401) {
        signOut({ redirect: false })
        router.push(getLocalizedUrl('/login', 'en'))

        return
      } else {
        console.error('Error fetching shops:', error.response?.data || error.message)
        setError('Failed to fetch shops. Please try again later.')
      }
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
      if (error?.response?.status === 401) {
        signOut({ redirect: false })
        router.push(getLocalizedUrl('/login', 'en'))

        return
      } else {
        console.error('Error fetching shop access:', error.response?.data || error.message)
        setError(error.response?.data?.message || 'Error fetching shop access')
      }
    }
  }

  const handleGroupChange = event => {
    const selectedGroupId = event.target.value

    setSelectedGroup(selectedGroupId)
    const selectedPermissions = allShops.find(shop => shop.group === selectedGroupId)?.staticReportPermissions || {}

    setStaticReportPermissions(selectedPermissions)
    setSelectedReportIndex(null)
  }

  const handleReportChange = event => {
    setSelectedReportIndex(parseInt(event.target.value, 10))
  }

  const handleStaticReportPermissionChange = (index, field, checked) => {
    setPermissionsState(prevState => {
      // Deep copy the previous state to avoid direct mutation
      const newState = { ...prevState }

      // Update the specific field with the new value
      set(newState[index], field, checked)

      return newState
    })
  }

  const handleUpdate = async event => {
    event.preventDefault()
    setLoading(true)
    setSuccessMessage('')
    setError(null)

    try {
      const token = session?.user?.id

      if (!token) throw new Error('Token not available')

      // Construct the staticReportPermissions payload
      const updatedStaticReportPermissions = permissionsState[selectedReportIndex]

      const permissions = [
        {
          group: selectedGroup || '',
          shopName: shops.find(shop => shop.group === selectedGroup)?.shopName || '',
          staticReportPermissions: updatedStaticReportPermissions
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
      if (error?.response?.status === 401) {
        signOut({ redirect: false })
        router.push(getLocalizedUrl('/login', 'en'))

        return
      } else {
        console.error('Error updating user data:', error)
        setError(error.response?.data?.message || error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const renderStaticReportPermissionsTable = useMemo(() => {
    if (!staticReportPermissions?.data || selectedReportIndex === null) {
      return null
    }

    const report = staticReportPermissions.data[selectedReportIndex] || {}

    const renderRows = (obj, prefix = '') => {
      return Object.entries(obj).map(([key, value]) => {
        if (key === 'fieldName') {
          return null
        }

        const isObject = typeof value === 'object' && value !== null
        const isArray = Array.isArray(value)
        const fieldKey = prefix ? `${prefix}.${key}` : key

        if (isArray) {
          return value.map((item, arrayIndex) => (
            <React.Fragment key={arrayIndex}>
              {Object.entries(item).map(([itemKey, itemValue]) => {
                const accessKey = `${fieldKey}[${arrayIndex}].${itemKey}`

                const isChecked =
                  permissionsState[selectedReportIndex]?.[accessKey] !== undefined
                    ? permissionsState[selectedReportIndex][accessKey]
                    : itemValue

                return (
                  <tr key={accessKey} className='bg-white hover:bg-gray-100'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{`${fieldKey}[${arrayIndex}].${itemKey}`}</td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <input
                        type='checkbox'
                        checked={isChecked}
                        onChange={e =>
                          handleStaticReportPermissionChange(selectedReportIndex, accessKey, e.target.checked)
                        }
                        className='form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out'
                      />
                    </td>
                  </tr>
                )
              })}
            </React.Fragment>
          ))
        }

        return (
          <tr key={fieldKey} className='bg-white hover:bg-gray-100'>
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{fieldKey}</td>
            <td className='px-6 py-4 whitespace-nowrap'>
              {isObject ? (
                renderRows(value, fieldKey)
              ) : (
                <input
                  type='checkbox'
                  checked={permissionsState[selectedReportIndex]?.[fieldKey] || value}
                  onChange={e => handleStaticReportPermissionChange(selectedReportIndex, fieldKey, e.target.checked)}
                  className='form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out'
                />
              )}
            </td>
          </tr>
        )
      })
    }

    return (
      <div className='overflow-x-auto mt-6'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Field</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Value</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>{renderRows(report)}</tbody>
        </table>
      </div>
    )
  }, [staticReportPermissions, selectedReportIndex, permissionsState])

  return (
    <div>
      <h1 className='text-xl font-bold mb-4'>Update User Permissions</h1>
      {error && <p className='text-red-500 mb-4'>{error}</p>}
      {successMessage && <p className='text-green-500 mb-4'>{successMessage}</p>}
      <form onSubmit={handleUpdate} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>Select Group:</label>
          <select
            value={selectedGroup}
            onChange={handleGroupChange}
            className='mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          >
            <option value=''>Select a Group</option>
            {shops.map(shop => (
              <option key={shop.group} value={shop.group}>
                {shop.group}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>Select Report:</label>
          <select
            value={selectedReportIndex !== null ? selectedReportIndex : ''}
            onChange={handleReportChange}
            className='mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          >
            <option value=''>Select a Report</option>
            {reportOptions.map(option => (
              <option key={option.index} value={option.index}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {renderStaticReportPermissionsTable}

        <button
          type='submit'
          disabled={loading}
          className={`mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            loading
              ? 'bg-gray-400'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  )
}

export default AllusersUpdate
