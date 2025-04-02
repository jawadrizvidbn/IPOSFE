// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllCreditorsCreditNotesTablesRecord from '@views/store/Creditors_Credit_Notes_Tables'

// Component imports

const Tables = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllCreditorsCreditNotesTablesRecord />
      </Grid>
    </Grid>
  )
}

export default Tables
