// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import Item_sales from '@views/store/Item_sales'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Item_sales />
      </Grid>
    </Grid>
  )
}

export default Tables
