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

// Coordinate the dedicated report page without modifying existing Redux report state.
export default function TierReport() {
  // Keep selected stores, date inputs, generated results and request state separate.
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

  // Clear stale results and cancel pending requests when stores change or the page closes.
  useEffect(() => {
    setReport(null)
    setError('')
    setLoading(false)

    // Render report controls, request feedback and the generated tier table.
    return () => pending.current?.abort()
  }, [shopKeys])

  // Replace any previous request and generate the report for the submitted inputs.
  async function generateReport(event) {
    event.preventDefault()
    pending.current?.abort()
    const controller = new AbortController()

    pending.current = controller
    setLoading(true)
    setError('')
    setReport(null)

    // Accept results only while this request is active and remember its actual period.
    try {
      const result = await getRetailWholesaleTierReport({ shopKeys, startDate, endDate }, controller.signal)

      if (controller.signal.aborted) return
      setReport(result)
      setPeriod({ startDate, endDate })
    } catch (failure) {
      // Ignore cancellation errors caused by navigation or a newer request.
      if (!controller.signal.aborted) setError(failure.message)
    } finally {
      // Prevent an obsolete request from changing the current loading indicator.
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  // Export visible groups with filenames based on the generated report’s period.
  function exportReport(type) {
    const rows = getExportRows(report, visibleTiers)
    const filename = `Retail-Wholesale-Tiers-${period.startDate}-${period.endDate}`

    // Reuse the existing CSV exporter for the flattened report rows.
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
      {/* Collect dates and keep generation/export actions together. */}
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
      {/* Display request failures separately from missing-data warnings. */}
      {error && (
        <Alert severity='error' className='mb-4'>
          {error}
        </Alert>
      )}
      {/* Render the actual report period, warnings and available transaction results. */}
      {report && (
        <>
          <Typography variant='body2' className='mb-4'>
            Report period: {period.startDate} to {period.endDate}
          </Typography>
          {/* Make incomplete branch/month coverage visible to the user. */}
          {report.warnings.map(warning => (
            <Alert severity='warning' key={warning} className='mb-2'>
              {warning}
            </Alert>
          ))}
          {/* Show filters and results, or an explicit empty-state message. */}
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
