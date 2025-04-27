/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { signOut, useSession } from 'next-auth/react'
import axios from 'axios'

import { getLocalizedUrl } from '@/utils/i18n'

const AllusersUpdate = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shops, setShops] = useState([])
  const [shopFields, setShopFields] = useState([{ shopName: '', group: '' }])
  const [userShops, setUserShops] = useState([])
  const [newPlan, setNewPlan] = useState('')
  const [newPlanEndDate, setNewPlanEndDate] = useState('')

  const userQuery = searchParams.get('user')

  useEffect(() => {
    if (userQuery) {
      try {
        const user = JSON.parse(userQuery)

        const formattedUserData = {
          ...user,
          planStartDate: user.planStartDate ? new Date(user.planStartDate).toISOString().slice(0, 16) : '',
          planEndDate: user.planEndDate ? new Date(user.planEndDate).toISOString().slice(0, 16) : ''
        }

        setUserData(formattedUserData)
        setShopFields(user.shopAccess || [{ shopName: '', group: '' }])
      } catch {
        setError('Error parsing user data')
      }
    }
  }, [userQuery])

  useEffect(() => {
    if (session && userData.id) {
      fetchShopsAndUserShops()
    }
  }, [session, userData.id])

  const handleError = message => {
    console.error(message)
    setError(message)
  }

  const fetchShopsAndUserShops = async () => {
    try {
      const token = session?.user?.token

      if (!token) throw new Error('Token not available')

      const [shopsResponse, userShopsResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/database/getallshop`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/getUserGroupsAndShops/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const shopsArray = Array.isArray(shopsResponse.data)
        ? shopsResponse.data
        : Object.entries(shopsResponse.data).map(([key, value]) => ({ id: key, name: key, ...value }))

      setShops(shopsArray)
      setUserShops(userShopsResponse.data)
    } catch (error) {
      if (error.response?.status === 401) {
        signOut({ redirect: false })
        router.push(getLocalizedUrl('/login', 'en'))
      } else {
        handleError('Error fetching data')
      }
    }
  }

  const handleUpdate = async event => {
    event.preventDefault()
    setLoading(true)

    try {
      const token = session?.user?.id

      if (!token) throw new Error('Token not available')

      const shopAccess = shopFields.map(({ shopName, group }) => ({ shopName, group }))
      // eslint-disable-next-line padding-line-between-statements
      const updatedUserData = {
        ...userData,
        shopAccess: shopAccess.length > 0 ? shopAccess : [{ group: userData.group, shopName: userData.shopName }]
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${userData.id}/shop-access`,
        updatedUserData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data) {
        setUserData(response.data)
        router.push('/en/apps/user/list')
      } else {
        throw new Error('Updated user data not found in response')
      }
    } catch (error) {
      handleError(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanUpdate = async () => {
    setLoading(true)

    if (!newPlan || !newPlanEndDate) {
      handleError('Please fill in both fields for the new plan update.')
      setLoading(false)

      return
    }

    try {
      const token = session?.user?.id

      if (!token) throw new Error('Token not available')

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/renewPlan`,
        { userId: userData.id, newPlan, newPlanEndDate },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data) {
        alert('Plan updated successfully!')
        setNewPlan('')
        setNewPlanEndDate('')
        router.push('/en/apps/user/list')
      }
    } catch (error) {
      handleError('Error updating plan')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event, index) => {
    const { name, value } = event.target

    setShopFields(prevFields => prevFields.map((field, i) => (i === index ? { ...field, [name]: value } : field)))
  }

  const handleShopChange = (event, index) => {
    const selectedShopId = event.target.value
    const selectedShop = shops.find(shop => shop.id === selectedShopId) || {}

    setShopFields(prevFields =>
      prevFields.map((field, i) => (i === index ? { ...field, group: selectedShop.id } : field))
    )
  }

  const addShopField = () => {
    setShopFields([...shopFields, { shopName: '', group: '' }])
  }

  const onDeleteShop = async shopId => {
    setLoading(true)

    try {
      const token = session?.user?.id

      if (!token) throw new Error('Token not available')

      // Make the request to remove shop access
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/removeShopAccess/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          shopAccess: [
            {
              group: userShops.find(shop => shop.id === shopId)?.group, // Get the group of the shop being deleted
              shopName: userShops.find(shop => shop.id === shopId)?.shopName // Get the name of the shop being deleted
            }
          ]
        }
      })

      // Remove the shop from the userShops state
      setUserShops(prevUserShops => prevUserShops.filter(shop => shop.id !== shopId))
    } catch (error) {
      handleError('Error removing shop access')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className='text-gray-500'>Loading...</p>
  }

  if (error) {
    return <p className='text-red-500'>Error: {error}</p>
  }

  return (
    <div className='max-w-7xl mx-auto p-6 bg-white shadow-md rounded-lg'>
      <h1 className='text-2xl font-bold mb-4'>User Details for ID: {userData.id}</h1>
      <form onSubmit={handleUpdate} className='space-y-4'>
        {['name', 'email', 'role'].map(field => (
          <label key={field} className='block'>
            <span className='text-gray-700'>{field.charAt(0).toUpperCase() + field.slice(1)}:</span>
            <input
              type={field === 'email' ? 'email' : 'text'}
              name={field}
              value={userData[field] || ''}
              onChange={event => setUserData({ ...userData, [field]: event.target.value })}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            />
          </label>
        ))}

        {shopFields.map((field, index) => (
          <div key={index}>
            <label className='block'>
              <span className='text-gray-700'>Select Shop:</span>
              <select
                value={field.group}
                onChange={event => handleShopChange(event, index)}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              >
                <option value=''>Select a shop</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </label>
            <label className='block'>
              <span className='text-gray-700'>Shop Name:</span>
              <input
                type='text'
                name='shopName'
                value={field.shopName}
                onChange={event => handleChange(event, index)}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
            </label>
          </div>
        ))}

        <button
          type='button'
          onClick={addShopField}
          className='px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        >
          Add Shop
        </button>

        <button
          type='submit'
          className='px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        >
          Update User
        </button>
      </form>

      <div className='mt-8'>
        <h2 className='text-2xl font-semibold mb-4'>User Shops</h2>
        {userShops.length > 0 ? (
          <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>#</th>
                <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Shop Name
                </th>
                <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Group
                </th>
                <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {userShops.map((shop, index) => (
                <tr key={index}>
                  <td className='px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{index + 1}</td>
                  <td className='px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{shop.shopName}</td>
                  <td className='px-2 py-4 whitespace-nowrap text-sm text-gray-500'>{shop.group}</td>
                  <td className='px-2 py-4 whitespace-nowrap text-sm'>
                    <button className='text-red-600 hover:text-red-900' onClick={() => onDeleteShop(shop.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className='text-gray-500'>No shops found for this user.</p>
        )}
      </div>

      <div className='mt-4'>
        <h2 className='text-lg font-semibold'>Plan Details</h2>
        {['plan', 'planStartDate', 'planEndDate'].map(field => (
          <label key={field} className='block'>
            <span className='text-gray-700'>
              {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
            </span>
            <input
              type={field.includes('Date') ? 'datetime-local' : 'text'}
              name={field}
              value={field === 'plan' ? userData.plan || '' : userData[field] || ''}
              onChange={event =>
                setUserData({
                  ...userData,
                  [field]: field === 'planActive' ? event.target.value === 'true' : event.target.value
                })
              }
              readOnly={field === 'plan'}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            />
          </label>
        ))}

        <label className='block'>
          <span className='text-gray-700'>New Plan:</span>
          <input
            type='text'
            value={newPlan}
            onChange={event => setNewPlan(event.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </label>
        <label className='block'>
          <span className='text-gray-700'>New Plan End Date:</span>
          <input
            type='datetime-local'
            value={newPlanEndDate}
            onChange={event => setNewPlanEndDate(event.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </label>
        <button
          type='button'
          onClick={handlePlanUpdate}
          className='mt-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
        >
          Update Plan
        </button>
      </div>
    </div>
  )
}

export default AllusersUpdate
