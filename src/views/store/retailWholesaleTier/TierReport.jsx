'use client'

import { useEffect, useRef, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { Alert, Button, Card, CircularProgress, TextField, Typography } from '@mui/material'
import * as XLSX from 'xlsx'

import { getRetailWholesaleTierReport } from '@/services/retailWholesaleTierService'
import { exportCSVFromData } from '@/helpers/exportHelpers'

import TierFilters from './TierFilters'
import TierReportTable from './TierReportTable'
import { getExportRows, TIERS } from './reportColumns'

export default function TierReport() {
  const search = useSearchParams()
  const shopKeys = search.get('shopKeys') || ''
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [visibleTiers, setVisibleTiers] = useState(TIERS.map(tier => tier.key))
  const [report, setReport] = useState(null)
  const [period, setPeriod] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(null)

  useEffect(() => {
    setReport(null)
    setError('')
    setLoading(false)

    return () => pending.current?.abort()
  }, [shopKeys])

  async function generateReport(event) {
    event.preventDefault()
    pending.current?.abort()
    const controller = new AbortController()

    pending.current = controller
    setLoading(true)
    setError('')
    setReport(null)

    try {
      const result = await getRetailWholesaleTierReport({ shopKeys, startDate, endDate }, controller.signal)

      if (controller.signal.aborted) return
      setReport(result)
      setPeriod({ startDate, endDate })
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  function exportReport(type) {
    const rows = getExportRows(report, visibleTiers)
    const filename = `Retail-Wholesale-Tiers-${period.startDate}-${period.endDate}`

    if (type === 'csv') {
      exportCSVFromData(rows, `${filename}.csv`)
      return
    }

    // json_to_sheet preserves numeric zero and stock-code strings.
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Retail Wholesale Tiers')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  return (
    <Card className='p-6'>
      <Typography variant='h4' align='center' className='mb-2'>
        Retail / Wholesale Tier Report
      </Typography>
      <Typography align='center' className='mb-6'>
        Selected stores: {shopKeys.split(',').join(', ') || 'None'}
      </Typography>
      <form onSubmit={generateReport} className='flex flex-wrap justify-center items-end gap-4 mb-4'>
        <TextField
          label='Start Date'
          type='date'
          value={startDate}
          required
          InputLabelProps={{ shrink: true }}
          onChange={event => setStartDate(event.target.value)}
        />
        <TextField
          label='End Date'
          type='date'
          value={endDate}
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: startDate }}
          onChange={event => setEndDate(event.target.value)}
        />
        <Button type='submit' variant='contained' disabled={loading || !shopKeys}>
          {loading ? <CircularProgress size={24} color='inherit' /> : 'Generate Report'}
        </Button>
        <Button variant='outlined' disabled={!report?.data.length || loading} onClick={() => exportReport('csv')}>
          CSV
        </Button>
        <Button variant='outlined' disabled={!report?.data.length || loading} onClick={() => exportReport('excel')}>
          Excel
        </Button>
      </form>
      {error && (
        <Alert severity='error' className='mb-4'>
          {error}
        </Alert>
      )}
      {report && (
        <>
          <Typography variant='body2' className='mb-4'>
            Report period: {period.startDate} to {period.endDate}
          </Typography>
          {report.warnings.map(warning => (
            <Alert severity='warning' key={warning} className='mb-2'>
              {warning}
            </Alert>
          ))}
          {report.data.length ? (
            <>
              <TierFilters value={visibleTiers} onChange={setVisibleTiers} />
              <TierReportTable report={report} visibleTiers={visibleTiers} />
              <Typography variant='caption'>
                Scroll horizontally to compare selected stores. Values are the sum of transaction line totals.
              </Typography>
            </>
          ) : (
            <Alert severity='info'>No transactions found for the selected stores and dates.</Alert>
          )}
        </>
      )}
    </Card>
  )
}
