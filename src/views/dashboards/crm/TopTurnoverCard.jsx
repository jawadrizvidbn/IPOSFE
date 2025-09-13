// ─────────────────────────────────────────────────────────────────────────────
// TopTurnoverCard.jsx
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

// Helper to format large numbers as “$123K” / “$1.2M” etc.
const formatCurrency = num => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return `${num.toFixed(2)}`
}

const TopTurnoverCard = ({}) => {
  const topTurnoverData = useSelector(state => state.dashboard.topTurnoverStores)
  const loading = useSelector(state => state.dashboard.getTopStoresStatus === thunkStatus.LOADING)
  return (
    <Card>
      <CardHeader
        title='Top Stores by Turnover'
        subheader={`Showing top Stores by total sales for ${new Date().getFullYear()}`}
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Export', 'Details']} />}
      />
      <CardContent>
        {loading ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {topTurnoverData.map((shop, idx) => (
              <Grid item xs={12} sm={6} md={4} key={shop.shopKey}>
                <div className='flex items-start gap-3'>
                  <CustomAvatar variant='rounded' color='primary' className='shadow-xs'>
                    {/* Example store icon */}
                    <i className='ri-store-2-line' />
                  </CustomAvatar>
                  <div>
                    {/* Store name */}
                    <Typography variant='subtitle2' noWrap>
                      {shop.shopKey}
                    </Typography>

                    {/* Total Selling */}
                    <Typography variant='h6'>{formatCurrency(shop.totalSelling)}</Typography>

                    {/* Profit (smaller, muted) */}
                    <Typography variant='body2' color='textSecondary'>
                      Profit: {formatCurrency(shop.profit)}
                    </Typography>

                    {/* Optionally: show # transactions as a light tag */}
                    <Typography variant='caption' className='mt-1' color='textSecondary'>
                      {shop.totalTransactions.toLocaleString()} txns
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

TopTurnoverCard.propTypes = {
  turnoverData: PropTypes.arrayOf(
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

export default TopTurnoverCard
