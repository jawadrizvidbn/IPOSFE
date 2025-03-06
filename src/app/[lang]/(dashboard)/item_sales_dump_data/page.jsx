// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'

import AllDataItemSalesRecord from '@views/store/AllDataItemSalesRecords'

// Component imports

const ItemSalesDUMPDATA = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AllDataItemSalesRecord />
      </Grid>
    </Grid>
  )
}

export default ItemSalesDUMPDATA
