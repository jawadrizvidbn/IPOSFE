'use client'
import Link from 'next/link'

import { useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography' // Added for improved typography handling

import styles from '@core/styles/table.module.css'
import { getLocalizedUrl } from '@/utils/i18n'

const BasicDataTables = () => {
  const search = useSearchParams()
  const shopKey = search.get('shopKey')
  const displayShopKey = shopKey ? shopKey.toUpperCase() : 'DEFAULT SHOP'

  // Reports categorized by type
  const reportCategories = [
    {
      title: 'Sales Reports',
      reports: [
        { label: 'Item Sales Reports', href: getLocalizedUrl('/item_sales_dump_data', 'en') },
        { label: 'Daily Sales Reports', href: getLocalizedUrl('/item_daliy_dump_data', 'en') },
        { label: 'Cashup Reports', href: getLocalizedUrl('/cashup_sales_dump_data', 'en') },
        { label: 'Refunds Reports', href: getLocalizedUrl('/refunds_dump_data', 'en') },
        { label: 'Adjustment Reports', href: getLocalizedUrl('/adjustment_dump_data', 'en') },
        { label: 'GRV Reports', href: getLocalizedUrl('/grv_dump_data', 'en') },
        { label: 'GRV2 Reports', href: getLocalizedUrl('/grv2_dump_data', 'en') },
        { label: 'VOID Reports', href: getLocalizedUrl('/Void_dump_data', 'en') },
        { label: 'Price Change Reports', href: getLocalizedUrl('/PriceChange_dump_data', 'en') },
        { label: 'Payout Reports', href: getLocalizedUrl('/payout_dump_data', 'en') },
        { label: 'Cashup Report By Clerk', href: getLocalizedUrl('/CachupReportByClerk_dump_data', 'en') }
      ]
    },
    {
      title: 'Debtors Reports',
      reports: [
        { label: 'Debtors Credit Notes Reports', href: getLocalizedUrl('/DebtorsCreditNotes_dump_data', 'en') },
        { label: 'Debtors Debit Notes Reports', href: getLocalizedUrl('/DebtorsDebitNotes_dump_data', 'en') },
        { label: 'Debtors Invoices Reports', href: getLocalizedUrl('/DebtorsInvoices_dump_data', 'en') },
        { label: 'Debtors Payments Reports', href: getLocalizedUrl('/DebtorsPayment_dump_data', 'en') },
        { label: 'Debtors Value Report', href: getLocalizedUrl('/DebtorsValue_Report', 'en') }
      ]
    },
    {
      title: 'Creditors Reports',
      reports: [
        { label: 'Creditors Credit Notes Reports', href: getLocalizedUrl('/CreditorsCreditNotes_dump_data', 'en') },
        { label: 'Creditors Debit Notes Reports', href: getLocalizedUrl('/CreditorsDebitNotes_dump_data', 'en') },
        { label: 'Creditors Invoices Reports', href: getLocalizedUrl('/CreditorsInvoices_dump_data', 'en') },
        { label: 'Creditors Payments Reports', href: getLocalizedUrl('/CreditorPayment_dump_data', 'en') },
        { label: 'Creditors Value Report', href: getLocalizedUrl('/CreditorsValue_Report', 'en') } // done till here
      ]
    },
    {
      title: 'Invoice Reports',
      reports: [
        { label: 'History Product Sale By Invoice', href: getLocalizedUrl('/productBySaleInvoice_dump_data', 'en') },
        { label: 'Current Invoices', href: getLocalizedUrl('/current_invoices_dump_data', 'en') },
        { label: 'Invoices By Station', href: getLocalizedUrl('/HistoryInvoicesByStation_dump_data', 'en') },
        { label: 'Invoices By Clerk', href: getLocalizedUrl('/InvoicesByClerk_dump_data', 'en') }
      ]
    },
    {
      title: 'Stock Reports',
      reports: [
        { label: 'Stock Value Report', href: getLocalizedUrl('/StockValue_Report', 'en') },
        { label: 'Stock Activity Reports', href: getLocalizedUrl('/StockActivity_dump_data', 'en') },
        { label: 'Stock On Hand Reports', href: getLocalizedUrl('/StockOnHand_Report', 'en') }
      ]
    },
    {
      title: 'Debtors Analysis Reports',
      reports: [
        { label: 'Current Debtors Analysis', href: getLocalizedUrl('/CurrentDebtorsAnalysisReport', 'en') },
        { label: 'Current Creditors Age Analysis ', href: getLocalizedUrl('/CurrentCreditorsAgeAnalysisReport', 'en') },
        {
          label: 'Current Debtors Age AnalysisReport ',
          href: getLocalizedUrl('/CurrentDebtorsAgeAnalysisReport', 'en')
        }
      ]
    },
    {
      title: 'Stock Level Reports',
      reports: [
        { label: 'Min Stock Level', href: getLocalizedUrl('/MinStockLevelReport', 'en') },
        { label: 'Max Stock Level Report', href: getLocalizedUrl('/MaxStockLevelReport', 'en') }
      ]
    },
    {
      title: 'Pervious Debtors Age Analysis Report',
      reports: [
        { label: 'Pervious Debtors Age Analysis', href: getLocalizedUrl('/PerviousDebtorsAgeAnalysisReport', 'en') }
      ]
    },
    {
      title: 'Creditor Analysis Report',
      reports: [{ label: 'Creditor Analysis', href: getLocalizedUrl('/CreditorAnalysisReport', 'en') }]
    },
    {
      title: 'Six Weeks Report',
      reports: [{ label: 'Six Weeks', href: getLocalizedUrl('/SixWeeks_Report', 'en') }]
    },
    {
      title: 'Sale Rep Commission Report',
      reports: [
        { label: 'Sale Rep Commission', href: getLocalizedUrl('/SaleRepCommissionReport', 'en') },
        { label: 'Sale Rep Commission By Product', href: getLocalizedUrl('/SaleRepCommissionByProductReport', 'en') }
      ]
    },
    {
      title: 'Statements Report',
      reports: [
        { label: 'Current Debort Statement', href: getLocalizedUrl('/CurrentDebtorsStatementReport', 'en') },
        { label: 'Perivous Debort Statement', href: getLocalizedUrl('/PerviousDebtorsStatementReport', 'en') },
        { label: 'Current Creditor Statement', href: getLocalizedUrl('/CurrentCreditorStatementReport', 'en') },
        { label: 'Perivous Creditor Statement', href: getLocalizedUrl('/PerviousCreditorStatementReport', 'en') }
      ]
    }
  ]

  return (
    <Card className='p-5 shadow-lg bg-white rounded-lg'>
      <div className='flex justify-center mb-4'>
        <CardHeader
          title={
            <Typography variant='h5' component='span' className='font-semibold text-primary'>
              {`${displayShopKey} Store Reports`}
            </Typography>
          }
          className='flex-col items-start text-center'
          sx={{
            '& .MuiCardHeader-action': { m: 0 }
          }}
        />
      </div>
      <Grid container spacing={4} justifyContent='center'>
        {reportCategories.map((category, catIndex) => (
          <Grid item xs={12} key={catIndex}>
            <Typography variant='h6' align='center' className='font-bold my-4'>
              {category.title}
            </Typography>
            <Grid container spacing={2} justifyContent='center'>
              {category.reports.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Link href={{ pathname: item.href, query: { shopKey } }} passHref>
                    <button
                      className={`w-full py-4 text-white text-lg ${styles.customButton}`}
                      aria-label={`Navigate to ${item.label}`}
                      style={{
                        background: 'linear-gradient(90deg, #6a1b9a 0%, #8e24aa 100%)', // Smooth gradient with purple
                        borderRadius: '30px', // Rounded shape
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', // Subtle shadow
                        transition: 'transform 0.3s ease, background-color 0.3s ease'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#9c27b0' // Slightly brighter on hover
                        e.currentTarget.style.transform = 'scale(1.05)' // Subtle scale up on hover
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #6a1b9a 0%, #8e24aa 100%)' // Reset background
                        e.currentTarget.style.transform = 'scale(1)' // Reset scale
                      }}
                    >
                      {item.label}
                    </button>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Card>
  )
}

export default BasicDataTables
