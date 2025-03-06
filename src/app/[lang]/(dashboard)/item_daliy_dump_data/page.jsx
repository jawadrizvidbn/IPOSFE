// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllDataHistoryDaliySalesRecords from '@views/store/AllDataHistoryDaliySalesRecords'

// Component imports

const ItemSalesDUMPDATA = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllDataHistoryDaliySalesRecords />
      </Grid>
    </Grid>
  )
}

export default ItemSalesDUMPDATA
