import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'

import { TIERS } from './reportColumns'

// Toggle classification columns without changing backend classifications or totals.
export default function TierFilters({ value, onChange }) {
  return (
    <div className='mb-4'>
      <Typography variant='subtitle2'>Filter by Type</Typography>
      {/* Give each classification an independent visibility checkbox. */}
      <FormGroup row>
        {TIERS.map(tier => (
          <FormControlLabel
            key={tier.key}
            label={tier.label}
            control={
              <Checkbox
                checked={value.includes(tier.key)}
                onChange={(_, checked) => {
                  onChange(checked ? [...value, tier.key] : value.filter(key => key !== tier.key))
                }}
              />
            }
          />
        ))}
      </FormGroup>
      {/* Explain tier thresholds and the grouping rule alongside the controls. */}
      <Typography variant='body2'>
        ComboGroup: grouped quantity exactly 3, 6 or 9 · Category: 10–99, 100–999 or 1000+.
      </Typography>
      <Typography variant='caption'>
        Combo and Category groups use the grouping shown above. Markers and stores/months stay separate. Unexpected records retain
        their existing Retail or Wholesale classification and appear as validation warnings. Subtotals include their amounts and hidden columns;
        add Retail Total and Wholesale Total to reconcile the overall Total.
      </Typography>
    </div>
  )
}
