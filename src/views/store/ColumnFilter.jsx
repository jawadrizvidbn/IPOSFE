import React, { useMemo, useState, useEffect } from 'react'
import { FormControl, InputLabel, Select, MenuItem, Typography, Box, Chip, TextField, Grid } from '@mui/material'
import { removeKeys } from '@/utils'
import { FIXED_COLUMNS } from '@/helpers/acrossReportConst'

function ColumnFilter({ reportData, setFilteredReportData }) {
  const [fieldFilters, setFieldFilters] = useState({})

  const { storeOptions, fieldOptions } = useMemo(() => {
    if (!reportData || reportData.length === 0) return { storeOptions: {}, fieldOptions: {} }

    const storeOpts = {}
    const fieldOpts = {}

    const storeFields = new Set()
    reportData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key.includes('_')) {
          storeFields.add(key)
        }
      })
    })

    const storeNames = [
      ...new Set(
        [...storeFields].map(field => {
          const parts = field.split('_')
          return parts[0]
        })
      )
    ]

    storeNames.forEach(storeName => {
      const fields = [...storeFields]
        .filter(field => field.startsWith(`${storeName}_`))
        .map(field => ({
          key: field,
          label: field.substring(field.indexOf('_') + 1)
        }))

      let displayName = storeName

      const storeNameField = fields.find(f => f.label.toLowerCase() === 'storename')
      if (storeNameField) {
        for (const item of reportData) {
          if (item[storeNameField.key]) {
            displayName = item[storeNameField.key]
            break
          }
        }
      }

      storeOpts[storeName] = {
        displayName,
        fields
      }

      fields.forEach(field => {
        if (!fieldOpts[field.label]) {
          fieldOpts[field.label] = new Set()
        }

        reportData.forEach(item => {
          if (item[field.key] !== undefined && item[field.key] !== null) {
            fieldOpts[field.label].add(item[field.key])
          }
        })
      })
    })

    Object.keys(fieldOpts).forEach(field => {
      fieldOpts[field] = Array.from(fieldOpts[field])
    })

    return { storeOptions: storeOpts, fieldOptions: fieldOpts }
  }, [reportData])

  const handleFieldFilterChange = (fieldName, value) => {
    setFieldFilters(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleFilterDelete = field => {
    setFieldFilters(prev => removeKeys(prev, [field]))
  }

  useEffect(() => {
    const data = reportData[0]
    const filteredKeys = []
    Object.entries(data).forEach(([key, value]) => {
      if (Object.values(fieldFilters).includes(value)) {
        filteredKeys.push(key.split('_')[0])
      }
    })

    const keysToRemove = Object.keys(data)
      .filter(key => {
        if (filteredKeys.every(fKey => key.startsWith(fKey))) {
          return false
        }
        return true
      })
      .filter(key => !FIXED_COLUMNS.includes(key))

    setFilteredReportData(reportData.map(r => removeKeys(r, keysToRemove)))
  }, [fieldFilters])
  return (
    <Box sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant='subtitle1' fontWeight='medium' mb={2}>
        Filter Store Columns
      </Typography>

      <Typography variant='subtitle2' mb={1}>
        Filter by Field Values
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {Object.entries(fieldOptions).map(([fieldName, values]) => (
          <Grid item xs={12} sm={6} md={4} key={fieldName}>
            <FormControl fullWidth size='small'>
              <InputLabel id={`field-filter-${fieldName}`}>{fieldName}</InputLabel>
              <Select
                labelId={`field-filter-${fieldName}`}
                value={fieldFilters[fieldName] || ''}
                onChange={e => handleFieldFilterChange(fieldName, e.target.value)}
                label={fieldName}
              >
                {values.map(value => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} sx={{ mb: 2, mt: 2, ml: 2 }}>
        {Object.keys(fieldFilters).length > 0 && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {Object.entries(fieldFilters).map(([field, values]) => {
              if (!values || (Array.isArray(values) && values.length === 0)) return null
              return (
                <Chip
                  key={field}
                  label={`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${values}`}
                  onDelete={() => handleFilterDelete(field)}
                  size='small'
                  color='primary'
                  variant='outlined'
                />
              )
            })}
            <Chip label='Clear All Filters' onDelete={() => setFieldFilters({})} size='small' color='secondary' />
          </div>
        )}
      </Grid>
    </Box>
  )
}

export default ColumnFilter
