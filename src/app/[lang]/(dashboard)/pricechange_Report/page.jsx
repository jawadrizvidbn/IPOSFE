// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import PriceChangeReport from '@views/store/PriceChange_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <PriceChangeReport /> 
      </Grid>
    </Grid>
  )
}

export default Tables
