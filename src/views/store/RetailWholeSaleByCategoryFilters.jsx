import React from 'react'
import { FormGroup, FormControlLabel, Checkbox, Typography, Box, FormControl } from '@mui/material'

function RetailWholeSaleByCategoryFilters({ value, onChange }) {
  return (
    <div className='flex'>
      <FormControl className='w-full' component='fieldset' sx={{ width: 270, px: 2, py: 1 }}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={value.sub1}
                onChange={e => onChange({ ...value, sub1: e.target.checked })}
                name='sub1'
              />
            }
            label='Sub 1'
            sx={{ mr: 3 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.sub2}
                onChange={e => onChange({ ...value, sub2: e.target.checked })}
                name='sub2'
              />
            }
            label='Sub 2'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.totalCost}
                onChange={e => onChange({ ...value, totalCost: e.target.checked })}
                name='totalCost'
              />
            }
            label='Total Cost'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.totalSelling}
                onChange={e => onChange({ ...value, totalSelling: e.target.checked })}
                name='totalSelling'
              />
            }
            label='Total Selling'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.retailCost}
                onChange={e => onChange({ ...value, retailCost: e.target.checked })}
                name='retailCost'
              />
            }
            label='Retail Cost'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.retailSelling}
                onChange={e => onChange({ ...value, retailSelling: e.target.checked })}
                name='retailSelling'
              />
            }
            label='Retail Selling'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.wholesaleCost}
                onChange={e => onChange({ ...value, wholesaleCost: e.target.checked })}
                name='wholesaleCost'
              />
            }
            label='Wholesale Cost'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={value.wholesaleSelling}
                onChange={e => onChange({ ...value, wholesaleSelling: e.target.checked })}
                name='wholesaleSelling'
              />
            }
            label='Wholesale Selling'
          />
        </FormGroup>
      </FormControl>
    </div>
  )
}

export default RetailWholeSaleByCategoryFilters
