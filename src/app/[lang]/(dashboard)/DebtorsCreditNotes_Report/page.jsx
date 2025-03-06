// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import DebtorsCreditNotesReports from '@views/store/DebtorsCreditNotes_Report'

// Component imports


const Tables = () => {
  return (
    <Grid container spacing={6}>

<Grid item xs={12}>
        <DebtorsCreditNotesReports /> 
      </Grid>
    </Grid>
  )
}

export default Tables
