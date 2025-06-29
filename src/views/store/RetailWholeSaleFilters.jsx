import React from 'react'
import { FormGroup, FormControlLabel, Checkbox, Typography, Box, FormControl } from '@mui/material'

function RetailWholeSaleFilters({
  value = [],
  onChange,
  setIsRetailDetailedReport,
  isRetailDetailedReport,
  showOnlyIsDetailFilter = false
}) {
  return (
    <div className='flex justify-between w-full'>
      {!showOnlyIsDetailFilter && (
        <FormControl component='fieldset' sx={{ width: 270, px: 2, py: 1 }}>
          <Typography variant='subtitle1' gutterBottom>
            Filter by Type
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.includes('retail')}
                  onChange={e => onChange(e.target.name, e.target.checked)}
                  name='retail'
                />
              }
              label='Retail'
              sx={{ mr: 3 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.includes('wholesale')}
                  onChange={e => onChange(e.target.name, e.target.checked)}
                  name='wholesale'
                />
              }
              label='Wholesale'
            />
          </FormGroup>
        </FormControl>
      )}

      <FormControl component='fieldset' sx={{ width: 200, px: 2, py: 1 }}>
        <Typography variant='subtitle1' gutterBottom>
          Report Type
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRetailDetailedReport}
                onChange={e => setIsRetailDetailedReport(e.target.checked)}
                name='retail'
              />
            }
            label='Detailed Report'
            sx={{ mr: 3 }}
          />
        </FormGroup>
      </FormControl>
    </div>
  )
}

export default RetailWholeSaleFilters
