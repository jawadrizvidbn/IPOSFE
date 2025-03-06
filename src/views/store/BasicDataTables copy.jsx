'use client'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useDispatch, useSelector } from 'react-redux'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { signOut, useSession } from 'next-auth/react'

import { setShopKey } from '@/redux/reducers/shopKeySlice'

import { getLocalizedUrl } from '@/utils/i18n'

const BasicDataTables = () => {
  const [loading, setLoading] = useState(true)
  const [shopKeys, setShopKeys] = useState([])
  const router = useRouter()
  const dispatch = useDispatch()
  const currentShopKey = useSelector(state => state.shopKey)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchShops = async () => {
      try {
        if (!session) return // Ensure session is defined before fetching
        const Token = session?.user?.id

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/database/getallshop`, {
          headers: {
            Authorization: `Bearer ${Token}`
          }
        })

        if (response.status === 401) {
          signOut({ redirect: false })
          router.push(getLocalizedUrl('/login', 'en'))

          return
        }

        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()

        setShopKeys(Object.keys(data))
      } catch (error) {
        console.error('Error fetching shops:', error)
      } finally {
        setLoading(false) // Set loading to false once data is fetched
      }
    }

    fetchShops()
  }, [router, session])

  const handleShopClick = async shopKey => {
    try {
      if (!session) {
        throw new Error('User session not found')
      }

      const Token = session?.user?.id

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/database/activedatabase/${shopKey}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Token}`
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      dispatch(setShopKey(shopKey))
      router.push('/reports')
      console.log(`Dispatched shopKey: ${shopKey}`)
    } catch (error) {
      if (error.response.status === 401) {
        signOut({ redirect: false })
        router.push(getLocalizedUrl('/login', 'en'))

        return
      } else {
        console.error('Error activating shop:', error)
      }
    }
  }

  return (
    <Card>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-semibold text-primary'>
              <span className='text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>Your Store</span>
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
      <div className='flex flex-wrap justify-center m-3'>
        {loading ? (
          <p>Loading shops...</p>
        ) : shopKeys.length > 0 ? (
          shopKeys.map((shopKey, index) => {
            const formattedShopKey = shopKey.charAt(0).toUpperCase() + shopKey.slice(1)

            return (
              <button
                key={index}
                onClick={() => handleShopClick(shopKey)}
                className='w-48 h-16 mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg'
              >
                {formattedShopKey}
              </button>
            )
          })
        ) : (
          <p>No shops available</p>
        )}
      </div>
    </Card>
  )
}

export default BasicDataTables
