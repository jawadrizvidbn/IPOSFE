'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { signOut, useSession } from 'next-auth/react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

import { setShopKey } from '@/redux/reducers/shopKeySlice'
import { getLocalizedUrl } from '@/utils/i18n'
import { logout } from '@/redux/reducers/authSlice'
import { getAllShop } from '@/redux/reducers/databaseSlice'
import { thunkStatus } from '@/utils/statusHandler'
import { setReportType } from '@/redux/reducers/acrossReportsSlice'
import { REPORT_TYPES } from '@/helpers/acrossReportHelpers'

const MultipleStores = () => {
  const loading = useSelector(state => state.database.getAllShopStatus === thunkStatus.LOADING)
  const shopKeys = useSelector(state => state.database.allAcrossShops)
  const selectedReportType = useSelector(state => state.acrossReports.reportType)
  const [selectedShops, setSelectedShops] = useState([])
  const router = useRouter()
  const dispatch = useDispatch()
  const { data: session } = useSession()

  const fetchShops = useCallback(async () => {
    if (!session) return
    dispatch(getAllShop())
  }, [session?.user?.token, router])

  useEffect(() => {
    if (session) {
      fetchShops()
    }
  }, [session?.user?.token, fetchShops])

  const handleReportTypeChange = event => {
    dispatch(setReportType(event.target.value))
    setSelectedShops([])
  }

  const handleShopClick = shopKey => {
    if (!session || !selectedReportType) return
    setSelectedShops(prevSelected => {
      if (prevSelected.includes(shopKey)) {
        return prevSelected.filter(key => key !== shopKey)
      } else {
        return [...prevSelected, shopKey]
      }
    })
  }

  const handleSelectAll = () => {
    if (!selectedReportType) return

    if (selectedShops.length === shopKeys.length) {
      // If all shops are selected, deselect all
      setSelectedShops([])
    } else {
      // If not all shops are selected, select all
      setSelectedShops([...shopKeys])
    }
  }

  const activateSelectedShops = async () => {
    if (!session || selectedShops.length === 0 || !selectedReportType) return

    const baseNames = selectedShops.join(',')
    try {
      router.push(getLocalizedUrl(`Across_dump_data?shopKeys=${baseNames}&reportType=${selectedReportType}`, 'en'))
    } catch (error) {
      console.error('Error activating shops:', error)
      if (error.response && error.response.status === 401) {
        signOut({ redirect: false })
        router.push(getLocalizedUrl('/login', 'en'))
      }
    }
  }

  const isAllSelected = selectedShops.length === shopKeys.length && shopKeys.length > 0

  return (
    <Card className='p-8 shadow-xl rounded-lg mx-auto max-w-4xl bg-white transition-transform transform hover:scale-105'>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-bold text-center'>
              <span className='text-3xl sm:text-4xl text-black'>Please Select Multiple Across Store</span>
            </div>
          }
          className='text-center'
        />
      </div>

      <div className='mb-8'>
        <FormControl focused={true} variant='outlined' fullWidth>
          <InputLabel className='text-black border-black' id='report-type-label'>
            Report Type
          </InputLabel>
          <Select
            labelId='report-type-label'
            id='report-type-select'
            value={selectedReportType}
            label='Report Type'
            color='primary'
            onChange={handleReportTypeChange}
            className='text-black'
          >
            {REPORT_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Select All Button */}
      {shopKeys.length > 0 && (
        <div className='flex justify-center mb-6'>
          <button
            onClick={handleSelectAll}
            disabled={!selectedReportType}
            className={`${
              isAllSelected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
            } text-white py-2 px-6 rounded-full transition duration-300 ${
              !selectedReportType ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center mt-8'>
        {loading ? (
          <p className='text-xl text-gray-600 text-center'>Loading shops...</p>
        ) : shopKeys.length > 0 ? (
          shopKeys.map((shopKey, index) => {
            const formattedShopKey = shopKey.charAt(0).toUpperCase() + shopKey.slice(1)
            const isSelected = selectedShops.includes(shopKey)

            return (
              <button
                key={index}
                onClick={() => handleShopClick(shopKey)}
                disabled={!selectedReportType}
                className={`w-full h-14 text-xl ${
                  isSelected ? 'bg-orange-600 text-white' : 'text-orange-600 border border-orange-600'
                } py-2 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg ${
                  !selectedReportType ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {formattedShopKey}
              </button>
            )
          })
        ) : (
          <p className='text-xl text-gray-600 text-center'>No shops available</p>
        )}
      </div>

      <div className='flex justify-center mt-6'>
        <button
          onClick={activateSelectedShops}
          disabled={!selectedReportType || selectedShops.length === 0}
          className={`bg-green-600 text-white py-2 px-4 rounded-full transition duration-300 ${
            !selectedReportType || selectedShops.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
          }`}
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
