'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { useColorScheme, useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Util Imports
import { rgbaToHex } from '@/utils/rgbaToHex'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { getSalesOverview, setCurrentStore } from '@/redux/reducers/dashboardSlice'
import { thunkStatus } from '@/utils/statusHandler'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const CardWidgetsSalesOverview = () => {
  // Hooks
  const theme = useTheme()
  const { mode, systemMode } = useColorScheme()
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.auth.user)
  const currentStore = useSelector(state => state.dashboard.currentStore)
  const salesOverview = useSelector(state => state.dashboard.salesOverview)
  const salesOverviewLoading = useSelector(state => state.dashboard.getSalesOverviewStatus === thunkStatus.LOADING)
  const [duration, setDuration] = useState('monthly')
  console.log({ salesOverviewLoading })
  useEffect(() => {
    if (currentStore) {
      dispatch(getSalesOverview({ shopKey: currentStore, duration }))
    }
  }, [currentStore, duration])

  // Vars
  const _mode = (mode === 'system' ? systemMode : mode) || 'light'
  const textSecondary = rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.7)`)

  const handleStoreChange = event => {
    dispatch(setCurrentStore(event.target.value))
  }

  const handleDurationChange = value => {
    setDuration(value)
  }

  const options = {
    chart: {
      sparkline: { enabled: true }
    },
    grid: {
      padding: {
        left: 20,
        right: 20
      }
    },
    colors: [
      theme.palette.primary.main,
      rgbaToHex(`rgb(${theme.palette.primary.mainChannel} / 0.7)`),
      rgbaToHex(`rgb(${theme.palette.primary.mainChannel} / 0.5)`),
      theme.palette.customColors.trackBg
    ],
    stroke: { width: 0 },
    legend: { show: false },
    dataLabels: { enabled: false },
    labels: ['Apparel', 'Electronics', 'FMCG', 'Other Sales'],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        customScale: 0.9,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.875rem',
              color: textSecondary
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '24px',
              formatter: value => `${value}k`,
              color: rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.9)`)
            },
            total: {
              show: true,
              fontSize: '0.875rem',
              label: 'Top Item Sales',
              color: textSecondary,
              formatter: value => `${value.globals.seriesTotals.reduce((total, num) => total + num)}k`
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 1300,
        options: { chart: { height: 257 } }
      },
      {
        breakpoint: theme.breakpoints.values.lg,
        options: { chart: { height: 276 } }
      },
      {
        breakpoint: 1050,
        options: { chart: { height: 250 } }
      }
    ]
  }

  const grandTotal = salesOverview?.find(item => item.isGrand)?.totalSales || 0
  const products = salesOverview?.filter(item => !item.isGrand) || []

  return (
    <Card>
      <CardHeader
        title='Sales Overview'
        action={
          <div className='flex items-center gap-4'>
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <InputLabel id='store-select-label'>Store</InputLabel>
              <Select labelId='store-select-label' value={currentStore} label='Store' onChange={handleStoreChange}>
                {currentUser?.allowedStores?.map(store => (
                  <MenuItem key={store} value={store}>
                    {store}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <InputLabel id='duration-select-label'>Duration</InputLabel>
              <Select
                labelId='duration-select-label'
                value={duration}
                label='Duration'
                onChange={e => handleDurationChange(e.target.value)}
              >
                <MenuItem value='weekly'>Weekly</MenuItem>
                <MenuItem value='monthly'>Monthly</MenuItem>
                <MenuItem value='yearly'>Yearly</MenuItem>
              </Select>
            </FormControl>
          </div>
        }
      />
      {salesOverviewLoading ? (
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </CardContent>
      ) : (
        <CardContent>
          <Grid container>
            <Grid item xs={12} sm={6} sx={{ mb: [3, 0] }}>
              <AppReactApexCharts
                type='donut'
                height={277}
                width='100%'
                series={products.map(item => item.totalSales || 0)}
                options={{
                  ...options,
                  labels: products.map(item => item.stockdescription || 'Unknown Product')
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ my: 'auto' }}>
              <div className='flex items-center gap-3'>
                <CustomAvatar skin='light' color='primary' variant='rounded'>
                  <i className='ri-wallet-line text-primary' />
                </CustomAvatar>
                <div className='flex flex-col'>
                  <Typography>Number of Sales</Typography>
                  <Typography variant='h5'>${grandTotal.toLocaleString()}</Typography>
                </div>
              </div>
              <Divider className='mlb-6' />
              {products.length > 0 ? (
                <Grid container spacing={6}>
                  {products.map((product, index) => (
                    <Grid item xs={6} key={product.stockcode || index}>
                      <div className='flex items-center gap-2 mbe-1'>
                        <div>
                          <i className='ri-circle-fill text-[10px] text-primary' />
                        </div>
                        <Typography>{product.stockdescription || 'Unknown Product'}</Typography>
                      </div>
                      <Typography className='font-medium'>${(product.totalSales || 0).toLocaleString()}</Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
                  No sales data available for the selected period
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      )}
    </Card>
  )
}

export default CardWidgetsSalesOverview
