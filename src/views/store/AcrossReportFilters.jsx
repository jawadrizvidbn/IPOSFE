import React from 'react'
import {
  Card,
  CardHeader,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  OutlinedInput,
  Box,
  TextField
} from '@mui/material'
function AcrossReportFilters({ filterOptions, filters, handleFilterChange, handleFilterDelete }) {
  return (
    <div className='mb-6 p-4 border rounded-md '>
      <h3 className='text-lg font-semibold mb-3'>Filters</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Object.entries(filterOptions).map(([field, values]) => {
          if (!values || !values.length) return null

          return (
            <FormControl key={field} fullWidth size='small'>
              <InputLabel id={`filter-${field}-label`}>
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </InputLabel>
              {values.length <= 10 ? (
                <Select
                  labelId={`filter-${field}-label`}
                  value={filters[field] || ''}
                  onChange={e => handleFilterChange(field, e.target.value)}
                  label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                >
                  {values.map(value => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <TextField
                  label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  value={filters[field] || ''}
                  onChange={e => handleFilterChange(field, e.target.value)}
                  size='small'
                  fullWidth
                />
              )}
            </FormControl>
          )
        })}
      </div>
      {Object.keys(filters).length > 0 && (
        <div className='mt-3 flex flex-wrap gap-2'>
          {Object.entries(filters).map(([field, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null
            return (
              <Chip
                key={field}
                label={`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`}
                onDelete={() => handleFilterDelete(field)}
                size='small'
                color='primary'
                variant='outlined'
              />
            )
          })}
          <Chip label='Clear All Filters' onDelete={() => setFilters({})} size='small' color='secondary' />
        </div>
      )}
    </div>
  )
}

export default AcrossReportFilters
