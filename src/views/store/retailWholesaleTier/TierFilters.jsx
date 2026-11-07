import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'

import { TIERS } from './reportColumns'

export default function TierFilters({ value, onChange }) {
  return (
    <div className='mb-4'>
      <Typography variant='subtitle2'>Filter by Type</Typography>
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
      <Typography variant='body2'>
        Retail: unmarked or marked group quantity below 10 · Tier 1: ≥10 and &lt;100 · Tier 2: ≥100 and &lt;1,000 · Tier
        3: ≥1,000
      </Typography>
      <Typography variant='caption'>
        Groups use marked lines from the same sale, major category and subcategory within each store/month. Totals
        always include all four classifications.
      </Typography>
    </div>
  )
}
