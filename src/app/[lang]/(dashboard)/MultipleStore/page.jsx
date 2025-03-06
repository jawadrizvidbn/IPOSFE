// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import MultipleStores from '@views/store/MultipleStores'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <MultipleStores />
      </Grid>
    </Grid>
  )
}

export default Tables
