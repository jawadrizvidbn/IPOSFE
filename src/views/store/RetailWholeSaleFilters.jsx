import React from 'react'
import { FormGroup, FormControlLabel, Checkbox, Typography, Box, FormControl } from '@mui/material'

function RetailWholeSaleFilters({ value = [], onChange }) {
  return (
    <FormControl component='fieldset' sx={{ width: '100%', px: 2, py: 1 }}>
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
  )
}

export default RetailWholeSaleFilters
