'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { useColorScheme, useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// Components Imports
import OptionsMenu from '@core/components/option-menu'

// Util Imports
import { rgbaToHex } from '@/utils/rgbaToHex'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { getRevenueReport, setCurrentStore } from '@/redux/reducers/dashboardSlice'
import { thunkStatus } from '@/utils/statusHandler'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const RevenueReport = () => {
  // Hooks
  const theme = useTheme()
  const { mode, systemMode } = useColorScheme()
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.auth.user)
  const currentStore = useSelector(state => state.dashboard.currentStore)
  const revenueData = useSelector(state => state.dashboard.revenueReport)
  const revenueLoading = useSelector(state => state.dashboard.getRevenueReportStatus === thunkStatus.LOADING)

  // Set first store as default if not already set
  useEffect(() => {
    if (currentUser?.allowedStores?.length > 0 && !currentStore) {
      dispatch(setCurrentStore(currentUser.allowedStores[0]))
    }
  }, [currentUser, currentStore, dispatch])

  useEffect(() => {
    if (currentStore) {
      dispatch(getRevenueReport({ shopKey: currentStore }))
    }
  }, [currentStore, dispatch])

  // Vars
  const _mode = (mode === 'system' ? systemMode : mode) || 'light'

  const handleStoreChange = event => {
    dispatch(setCurrentStore(event.target.value))
  }

  const series = revenueData?.data
    ? [
        {
          name: 'Earning',
          data: revenueData.data.map(item => item.earning)
        },
        {
          name: 'Expense',
          data: revenueData.data.map(item => item.expense)
        }
      ]
    : []

  const options = {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: value => `$${value.toLocaleString()}`
      }
    },
    grid: {
      show: false,
      padding: {
        left: -10,
        right: 0
      }
    },
    legend: {
      offsetY: 6,
      fontSize: '15px',
      markers: { radius: 15, height: 10, width: 10, offsetX: theme.direction === 'rtl' ? 7 : -4 },
      itemMargin: { horizontal: 9 },
      labels: { colors: rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.7)`) }
    },
    stroke: {
      width: 3,
      colors: [theme.palette.background.paper]
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#000']
      },
      formatter: value => `$${Math.abs(value).toLocaleString()}`
    },
    colors: [theme.palette.success.main, theme.palette.secondary.main],
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: '50%',
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all'
      }
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      categories: revenueData?.data?.map(item => item.month) || [],
      labels: {
        show: true,
        style: {
          colors: rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.7)`)
        }
      },
      axisTicks: {
        show: false
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false,
        formatter: value => `$${value.toLocaleString()}`,
        style: {
          colors: rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.7)`)
        }
      }
    },
    responsive: [
      {
        breakpoint: 1350,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '65%'
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '65%'
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '50%'
            }
          }
        }
      },
      {
        breakpoint: 700,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 6,
              columnWidth: '55%'
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '40%'
            }
          }
        }
      },
      {
        breakpoint: 500,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '55%'
            }
          }
        }
      },
      {
        breakpoint: 400,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 7,
              columnWidth: '60%'
            }
          }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader
        title='Revenue Report'
        action={
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel id='store-select-label'>Store</InputLabel>
            <Select labelId='store-select-label' value={currentStore || ''} label='Store' onChange={handleStoreChange}>
              {currentUser?.allowedStores?.map(store => (
                <MenuItem key={store} value={store}>
                  {store}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      {revenueLoading ? (
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </CardContent>
      ) : revenueData?.data?.length > 0 ? (
        <CardContent>
          <AppReactApexCharts type='bar' height={400} width='100%' series={series} options={options} />
        </CardContent>
      ) : (
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Typography color='text.secondary'>No revenue data available for the selected store</Typography>
        </CardContent>
      )}
    </Card>
  )
}

export default RevenueReport
