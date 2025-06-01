// ─────────────────────────────────────────────────────────────────────────────
// TopTransactionsCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import PropTypes from 'prop-types'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// (Re‐using your existing CustomAvatar + OptionMenu imports)
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import { useSelector } from 'react-redux'
import { thunkStatus } from '@/utils/statusHandler'
import { CircularProgress } from '@mui/material'

// Helper to format large numbers as “1,200” etc.
const formatNumber = num => num.toLocaleString()

const TopTransactionsCard = ({}) => {
  const topTransactionsData = useSelector(state => state.dashboard.topTransactionsStores)
  const loading = useSelector(state => state.dashboard.getTopStoresStatus === thunkStatus.LOADING)

  return (
    <Card>
      <CardHeader
        title='Top Stores by Transactions'
        subheader={`Showing top Stores by txn count for ${new Date().getFullYear()}`}
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Export', 'Details']} />}
      />
      <CardContent>
        {loading ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {topTransactionsData.map(shop => (
              <Grid item xs={12} sm={6} md={4} key={shop.shopKey}>
                <div className='flex items-start gap-3'>
                  <CustomAvatar variant='rounded' color='success' className='shadow-xs'>
                    {/* Example txn icon */}
                    <i className='ri-shopping-bag-line' />
                  </CustomAvatar>
                  <div>
                    {/* Store name */}
                    <Typography variant='subtitle2' noWrap>
                      {shop.shopKey}
                    </Typography>

                    {/* Total Transactions */}
                    <Typography variant='h6'>{formatNumber(shop.totalTransactions)} txns</Typography>

                    {/* Avg / Transaction */}
                    <Typography variant='body2' color='textSecondary'>
                      Avg/Txn: ${shop.avgPerTransaction.toFixed(2)}
                    </Typography>

                    {/* Optionally: show revenue as a tag */}
                    <Typography variant='caption' className='mt-1' color='textSecondary'>
                      Revenue: ${shop.totalSelling.toLocaleString()}
                    </Typography>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

TopTransactionsCard.propTypes = {
  transactionData: PropTypes.arrayOf(
    PropTypes.shape({
      shopKey: PropTypes.string.isRequired,
      totalCost: PropTypes.number.isRequired,
      totalSelling: PropTypes.number.isRequired,
      profit: PropTypes.number.isRequired,
      totalTransactions: PropTypes.number.isRequired,
      avgPerTransaction: PropTypes.number.isRequired
    })
  ).isRequired
}

export default TopTransactionsCard
