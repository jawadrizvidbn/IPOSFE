// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import StockActivityReport from '@views/store/StockActivity_Report.jsx'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <StockActivityReport /> 
      </Grid>
    </Grid>
  )
}

export default Tables
