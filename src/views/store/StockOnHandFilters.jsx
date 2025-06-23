import { Checkbox, FormControl, FormControlLabel, Typography, FormGroup } from '@mui/material'
import React from 'react'

function StockOnHandFilters({ value = [], onChange }) {
  return (
    <div className='flex justify-between w-full'>
      <FormControl component='fieldset' sx={{ px: 2, py: 1 }}>
        <Typography variant='subtitle1' gutterBottom>
          Hide Columns
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={value.includes('stockOnHand')}
                onChange={e => onChange(e.target.name, e.target.checked)}
                name='stockOnHand'
              />
            }
            label='Stock On Hand'
            sx={{ mr: 3 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.includes('productPrices')}
                onChange={e => onChange(e.target.name, e.target.checked)}
                name='productPrices'
              />
            }
            label='Product Prices'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.includes('totalPrices')}
                onChange={e => onChange(e.target.name, e.target.checked)}
                name='totalPrices'
              />
            }
            label='Total Prices'
          />
        </FormGroup>
      </FormControl>
    </div>
  )
}

export default StockOnHandFilters
