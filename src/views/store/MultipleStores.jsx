'use client'
import { useEffect, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { useDispatch, useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { signOut, useSession } from 'next-auth/react'

import { setShopKey } from '@/redux/reducers/shopKeySlice'
import { getLocalizedUrl } from '@/utils/i18n'

const MultipleStores = () => {
  const [loading, setLoading] = useState(true)
  const [shopKeys, setShopKeys] = useState([])
  const [selectedShops, setSelectedShops] = useState([]) // State for selected shops
  const router = useRouter()
  const dispatch = useDispatch()
  const { data: session } = useSession()

  // Fetch shops based on user session
  const fetchShops = useCallback(async () => {
    if (!session) return // Ensure session is defined before fetching
    const token = session.user.token

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/database/getallshop`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        signOut({ redirect: false })
        router.push(getLocalizedUrl('/login', 'en'))

        return
      }

      if (!response.ok) throw new Error('Failed to fetch shop data')

      const data = await response.json()

      setShopKeys(Object.keys(data))
    } catch (error) {
      console.error('Error fetching shops:', error)
    } finally {
      setLoading(false) // Set loading to false once data is fetched
    }
  }, [session, router])

  // Effect to fetch shops when session is available
  useEffect(() => {
    if (session) {
      fetchShops()
    }
  }, [session, fetchShops])

  // Handle shop selection
  const handleShopClick = shopKey => {
    if (!session) return
    setSelectedShops(prevSelected => {
      if (prevSelected.includes(shopKey)) {
        return prevSelected.filter(key => key !== shopKey) // Deselect shop
      } else {
        return [...prevSelected, shopKey] // Select shop
      }
    })
  }

  // Function to handle activation of selected shops
  const activateSelectedShops = async () => {
    if (!session || selectedShops.length === 0) return
    const token = session.user.token

    // Create a comma-separated list of selected shop keys
    const baseNames = selectedShops.join(',')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/database/activedatabaseMultiple/${baseNames}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error activating selected shops')
      // eslint-disable-next-line lines-around-comment
      // Optionally set the first selected shop key in redux
      // dispatch(setShopKey(selectedShops[0])) // Example: set the first selected shop key

      // Optionally navigate after activation
      router.push('/Across_dump_data') // Uncomment if you want to navigate to reports
    } catch (error) {
      console.error('Error activating shops:', error)
      // eslint-disable-next-line padding-line-between-statements
      if (error.response && error.response.status === 401) {
        signOut({ redirect: false })
        router.push(getLocalizedUrl('/login', 'en'))
      }
    }
  }

  return (
    <Card className='p-8 shadow-xl rounded-lg mx-auto max-w-4xl bg-white transition-transform transform hover:scale-105'>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-bold text-center'>
              <span className='text-3xl sm:text-4xl text-brown-600'>Please Select Multiple Across Store</span>
            </div>
          }
          className='text-center'
          titleTypographyProps={{
            style: {
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }
          }}
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center mt-8'>
        {loading ? (
          <p className='text-xl text-gray-600 text-center'>Loading shops...</p>
        ) : shopKeys.length > 0 ? (
          shopKeys.map((shopKey, index) => {
            const formattedShopKey = shopKey.charAt(0).toUpperCase() + shopKey.slice(1)
            const isSelected = selectedShops.includes(shopKey) // Check if shop is selected

            return (
              <button
                key={index}
                onClick={() => handleShopClick(shopKey)}
                className={`w-full h-14 text-xl ${
                  isSelected ? 'bg-orange-600 text-white' : 'text-orange-600 border border-orange-600'
                } py-2 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg`}
              >
                {formattedShopKey}
              </button>
            )
          })
        ) : (
          <p className='text-xl text-gray-600 text-center'>No shops available</p>
        )}
      </div>

      {/* Button to activate selected shops */}
      <div className='flex justify-center mt-6'>
        <button
          onClick={activateSelectedShops}
          className='bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-700 transition duration-300'
        >
          Activate Selected Shops
        </button>
      </div>

      <style jsx>{`
        @keyframes buttonAnimation {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-button {
          animation: buttonAnimation 0.5s ease-in-out infinite;
        }
      `}</style>
    </Card>
  )
}

export default MultipleStores
