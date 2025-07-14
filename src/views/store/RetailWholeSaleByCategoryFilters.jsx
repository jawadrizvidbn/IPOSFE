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
        </FormGroup>
      </FormControl>
    </div>
  )
}

export default RetailWholeSaleByCategoryFilters
