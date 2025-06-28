/* eslint-disable padding-line-between-statements */
/* eslint-disable import/order */
'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, Button, CircularProgress } from '@mui/material'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useDispatch, useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { copyToClipboard, exportCSV, exportExcel, printDocument, generatePDF } from '@/helpers/exportHelpers'
import { getReportTypeLabel, REPORT_TYPE_VALUES } from '@/helpers/acrossReportConst'
import { SortableTable } from '@/helpers/acrossReportHelpers'
import { cleanReportData, getAcrossReport } from '@/redux/reducers/acrossReportsSlice'
import { thunkStatus } from '@/utils/statusHandler'
import AcrossReportFilters from './AcrossReportFilters'
import RetailWholeSaleFilters from './RetailWholeSaleFilters'
import StockOnHandFilters from './StockOnHandFilters'
import ColumnFilter from './ColumnFilter'
import { removeKeys, sum, zeroTotals } from '@/utils'
import 'react-datepicker/dist/react-datepicker.css'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('Name', {
    cell: info => info.getValue(),
    header: 'Name'
  })
]

const MyCalendarContainer = ({ children }) => {
  return <div style={{ zIndex: 1000 }}>{children}</div>
}

const AllDataAccrossRecords = () => {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [filters, setFilters] = useState({})
  const [retailFilters, setRetailFilters] = useState([])
  const [stockOnHandFilters, setStockOnHandFilters] = useState([])
  const [visibleStores, setVisibleStores] = useState([])
  const [filteredReportData, setFilteredReportData] = useState([])
  const [isRetailDetailedReport, setIsRetailDetailedReport] = useState()
  const dispatch = useDispatch()
  const isLoading = useSelector(state => state.acrossReports.getAcrossReportStatus === thunkStatus.LOADING)
  const reportData = useSelector(state => state.acrossReports.reportData)
  const sortableKeys = useSelector(state => state.acrossReports.sortableKeys)
  const grandTotal = useSelector(state => state.acrossReports.grandTotal)
  const containerRef = useRef(null)

  const search = useSearchParams()
  const reportTypeFromSearch = search.get('reportType')
  const shopKeys = search.get('shopKeys')

  const reportType = useSelector(state => state.acrossReports.reportType) || reportTypeFromSearch
  const storeFields = useSelector(state => state.acrossReports.storeFields)

  useEffect(() => {
    return () => {
      dispatch(cleanReportData())
    }
  }, [])

  useEffect(() => {
    if (!reportData || reportData.length === 0) {
      setFilteredReportData([])
      return
    }

    if (Object.keys(filters).length === 0) {
      setFilteredReportData(reportData)
      return
    }

    const filtered = reportData.filter(item => {
      const shopData = storeFields.find(store => store[item.shopKey])
      if (!shopData) return false
      const storeInfo = shopData[item.shopKey]
      if (!storeInfo) return false

      return Object.entries(filters).every(([field, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return true

        const storeValue = storeInfo[field]

        if (Array.isArray(value)) {
          return value.includes(storeValue)
        }

        if (typeof storeValue === 'string' && typeof value === 'string') {
          return storeValue.toLowerCase().includes(value.toLowerCase())
        }

        return storeValue === value
      })
    })

    setFilteredReportData(filtered)
  }, [reportData, filters, storeFields])

  useEffect(() => {
    if (retailFilters.length === 0 || (retailFilters.includes('retail') && retailFilters.includes('wholesale'))) {
      setFilteredReportData(reportData)
      return
    }

    let keysToRemove = []

    if (retailFilters.length === 1 && retailFilters.includes('retail')) {
      keysToRemove = Object.keys(reportData[0] || {}).filter(key => key.toLowerCase().includes('wholesale'))
    } else if (retailFilters.length === 1 && retailFilters.includes('wholesale')) {
      keysToRemove = Object.keys(reportData[0] || {}).filter(key => key.toLowerCase().includes('retail'))
    }

    const filtered = reportData.map(item => removeKeys(item, keysToRemove))

    setFilteredReportData(filtered)
  }, [retailFilters, reportData])

  useEffect(() => {
    if (stockOnHandFilters.length === 0) {
      setFilteredReportData(reportData)
      return
    }

    let keysToRemove = []

    if (stockOnHandFilters.includes('stockOnHand')) {
      keysToRemove = [
        ...keysToRemove,
        ...Object.keys(reportData[0] || {}).filter(key => key.toLowerCase().includes('stock on hand'))
      ]
    }
    if (stockOnHandFilters.includes('productPrices')) {
      keysToRemove = [
        ...keysToRemove,
        ...Object.keys(reportData[0] || {}).filter(
          key => key.toLowerCase().includes('cost price') || key.toLowerCase().includes('selling price')
        )
      ]
    }
    if (stockOnHandFilters.includes('totalPrices')) {
      keysToRemove = [
        ...keysToRemove,
        ...Object.keys(reportData[0] || {}).filter(
          key => key.toLowerCase().includes('total cost') || key.toLowerCase().includes('total selling')
        )
      ]
    }

    let filtered = reportData.map(item => removeKeys(item, keysToRemove))
    if (stockOnHandFilters.includes('excludeNegatives')) {
      filtered = zeroTotals(filtered)
    }
    setFilteredReportData(filtered)
  }, [stockOnHandFilters, reportData])

  const filterOptions = useMemo(() => {
    if (!storeFields || storeFields.length === 0) return {}

    const options = {}
    if (reportType === 'turnover') {
      const allFields = new Set()
      storeFields.forEach(store => {
        Object.values(store).forEach(storeData => {
          Object.keys(storeData).forEach(field => {
            allFields.add(field)
          })
        })
      })

      allFields.forEach(field => {
        const values = new Set()
        storeFields.forEach(store => {
          Object.values(store).forEach(storeData => {
            if (storeData[field] !== undefined && storeData[field] !== null) {
              values.add(storeData[field])
            }
          })
        })
        options[field] = Array.from(values)
      })
    }

    return options
  }, [storeFields, reportType])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFilterDelete = field => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[field]
      return newFilters
    })
  }

  const handleRetailFilterChange = (name, value) => {
    setRetailFilters(prev => {
      if (value) {
        return [...prev, name]
      } else {
        return prev.filter(item => item !== name)
      }
    })
  }

  const handleStockOnHandFilterChange = (name, value) => {
    setStockOnHandFilters(prev => {
      if (value) {
        return [...prev, name]
      } else {
        return prev.filter(item => item !== name)
      }
    })
  }
  const generateReport = (isRetailDetailed = false) => {
    dispatch(
      getAcrossReport({
        params: { startDate, endDate, shopKeys, reportType, isDetailed: isRetailDetailed }
      })
    )
  }

  const handleRetailDetailedReportChange = value => {
    setIsRetailDetailedReport(value)
    generateReport(value)
  }

  const handleExport = type => {
    const table = document.querySelector('#tableContainer table')
    if (!table) return

    switch (type) {
      case 'copy':
        copyToClipboard(table)
        break
      case 'csv':
        exportCSV(table)
        break
      case 'excel':
        exportExcel(table)
        break
      case 'pdf':
        generatePDF(containerRef)
        break
      case 'print':
        printDocument()
        break
      default:
        break
    }
  }

  const dataSource = useMemo(() => {
    let finalData = []
    if (filteredReportData.length === 0) finalData = reportData
    if (filteredReportData.length > 0) {
      finalData = filteredReportData
    }

    if (reportType === REPORT_TYPE_VALUES.turnover && Array.isArray(finalData)) {
      finalData = [
        ...finalData,
        {
          shopKey: 'Grand Total',
          avgPerTransaction: sum(finalData.map(item => item.avgPerTransaction)),
          profit: sum(finalData.map(item => item.profit)),
          totalCost: sum(finalData.map(item => item.totalCost)),
          totalSelling: sum(finalData.map(item => item.totalSelling)),
          totalTransactions: sum(finalData.map(item => item.totalTransactions))
        }
      ]
    }
    return finalData
  }, [filteredReportData, reportData])

  return (
    <Card className='p-4' ref={containerRef} id='main'>
      <CardHeader
        title={
          <div className='flex flex-col items-center'>
            <span className='text-2xl font-bold'>{getReportTypeLabel(reportType)}</span>
          </div>
        }
      />
      <div className='p-6'>
        <div className='flex flex-col items-center'>
          <div className='flex-1 flex items-end gap-4 mb-5'>
            {reportType === REPORT_TYPE_VALUES.stockOnHand ? null : (
              <>
                <div className='flex-1'>
                  <label htmlFor='start' className='form-label  font-semibold block mb-2'>
                    <b>Start Date:</b>
                  </label>
                  <DatePicker
                    selected={startDate}
                    popperClassName='react-datepicker-popper'
                    onChange={date => setStartDate(date)}
                    dateFormat='yyyy-MM-dd'
                    placeholderText='YYYY-MM-DD'
                    className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full'
                  />
                </div>
                <div className='flex-1'>
                  <label htmlFor='end' className='form-label  font-semibold block mb-2'>
                    <b>End Date:</b>
                  </label>
                  <DatePicker
                    selected={endDate}
                    popperClassName='react-datepicker-popper'
                    onChange={date => setEndDate(date)}
                    dateFormat='yyyy-MM-dd'
                    placeholderText='YYYY-MM-DD'
                    className='form-control p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full'
                  />
                </div>
              </>
            )}
            <Button
              variant='contained'
              color='primary'
              onClick={() => generateReport()}
              disabled={isLoading}
              className='min-w-[120px]'
            >
              {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Generate Report'}
            </Button>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex gap-2' id='ActionsButtons'>
              <Button variant='outlined' onClick={() => handleExport('copy')} className='min-w-[80px]'>
                Copy
              </Button>
              <Button variant='outlined' onClick={() => handleExport('csv')} className='min-w-[80px]'>
                CSV
              </Button>
              <Button variant='outlined' onClick={() => handleExport('excel')} className='min-w-[80px]'>
                Excel
              </Button>
              <Button variant='outlined' onClick={() => handleExport('pdf')} className='min-w-[80px]'>
                PDF
              </Button>
              <Button variant='outlined' onClick={() => handleExport('print')} className='min-w-[80px]'>
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {reportType === REPORT_TYPE_VALUES.turnover && storeFields && storeFields.length > 0 && (
        <AcrossReportFilters
          filterOptions={filterOptions}
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleFilterDelete={handleFilterDelete}
          setFilters={setFilters}
        />
      )}

      {reportType === REPORT_TYPE_VALUES.retailWholesale && reportData.length > 0 && (
        <RetailWholeSaleFilters
          value={retailFilters}
          onChange={handleRetailFilterChange}
          setIsRetailDetailedReport={handleRetailDetailedReportChange}
          isRetailDetailedReport={isRetailDetailedReport}
        />
      )}

      {[REPORT_TYPE_VALUES.quantitySold, REPORT_TYPE_VALUES.products].includes(reportType) && reportData.length > 0 && (
        <ColumnFilter reportData={reportData} setFilteredReportData={setFilteredReportData} />
      )}

      {reportType === REPORT_TYPE_VALUES.stockOnHand && reportData.length > 0 && (
        <StockOnHandFilters value={stockOnHandFilters} onChange={handleStockOnHandFilterChange} />
      )}

      {reportData.length > 0 && (
        <SortableTable
          grandTotal={grandTotal}
          reportData={dataSource}
          reportType={reportType}
          sortableColumns={sortableKeys}
        />
      )}
    </Card>
  )
}

export default AllDataAccrossRecords
