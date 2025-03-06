'use client'
import Link from 'next/link'

import { useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography' // Added for improved typography handling

import styles from '@core/styles/table.module.css'

const BasicDataTables = () => {
  const shopKey = useSelector(state => state.shopKey)
  const displayShopKey = shopKey ? shopKey.toUpperCase() : 'DEFAULT SHOP'

  // Reports categorized by type
  const reportCategories = [
    {
      title: 'Sales Reports',
      reports: [
        { label: 'Item Sales Reports', href: '/item_sales_dump_data' },
        { label: 'Daily Sales Reports', href: '/item_daliy_dump_data' },
        { label: 'Cashup Reports', href: '/cashup_sales_dump_data' },
        { label: 'Refunds Reports', href: '/refunds_dump_data' },
        { label: 'Adjustment Reports', href: '/adjustment_dump_data' },
        { label: 'GRV Reports', href: '/grv_dump_data' },
        { label: 'GRV2 Reports', href: '/grv2_dump_data' },
        { label: 'VOID Reports', href: '/Void_dump_data' },
        { label: 'Price Change Reports', href: '/PriceChange_dump_data' },
        { label: 'Payout Reports', href: '/payout_dump_data' },
        { label: 'Cashup Report By Clerk', href: '/CachupReportByClerk_dump_data' }
      ]
    },
    {
      title: 'Debtors Reports',
      reports: [
        { label: 'Debtors Credit Notes Reports', href: '/DebtorsCreditNotes_dump_data' },
        { label: 'Debtors Debit Notes Reports', href: '/DebtorsDebitNotes_dump_data' },
        { label: 'Debtors Invoices Reports', href: '/DebtorsInvoices_dump_data' },
        { label: 'Debtors Payments Reports', href: '/DebtorsPayment_dump_data' },
        { label: 'Debtors Value Report', href: '/DebtorsValue_Report' }
      ]
    },
    {
      title: 'Creditors Reports',
      reports: [
        { label: 'Creditors Credit Notes Reports', href: '/CreditorsCreditNotes_dump_data' },
        { label: 'Creditors Debit Notes Reports', href: '/CreditorsDebitNotes_dump_data' },
        { label: 'Creditors Invoices Reports', href: '/CreditorsInvoices_dump_data' },
        { label: 'Creditors Payments Reports', href: '/CreditorPayment_dump_data' },
        { label: 'Creditors Value Report', href: '/CreditorsValue_Report' }
      ]
    },
    {
      title: 'Invoice Reports',
      reports: [
        { label: 'History Product Sale By Invoice', href: '/productBySaleInvoice_dump_data' },
        { label: 'Current Invoices', href: '/current_invoices_dump_data' },
        { label: 'Invoices By Station', href: '/HistoryInvoicesByStation_dump_data' },
        { label: 'Invoices By Clerk', href: '/InvoicesByClerk_dump_data' }
      ]
    },
    {
      title: 'Stock Reports',
      reports: [
        { label: 'Stock Value Report', href: '/StockValue_Report' },
        { label: 'Stock Activity Reports', href: '/StockActivity_dump_data' },
        { label: 'Stock On Hand Reports', href: '/StockOnHand_Report' }
      ]
    },
    {
      title: 'Debtors Analysis Reports',
      reports: [
        { label: 'Current Debtors Analysis', href: '/CurrentDebtorsAnalysisReport' },
        { label: 'Current Creditors Age Analysis ', href: '/CurrentCreditorsAgeAnalysisReport' },
        { label: 'Current Debtors Age AnalysisReport ', href: '/CurrentDebtorsAgeAnalysisReport' }
      ]
    },
    {
      title: 'Stock Level Reports',
      reports: [
        { label: 'Min Stock Level', href: '/MinStockLevelReport' },
        { label: 'Max Stock Level Report', href: '/MaxStockLevelReport' }
      ]
    },
    {
      title: 'Pervious Debtors Age Analysis Report',
      reports: [{ label: 'Pervious Debtors Age Analysis', href: '/PerviousDebtorsAgeAnalysisReport' }]
    },
    {
      title: 'Creditor Analysis Report',
      reports: [{ label: 'Creditor Analysis', href: '/CreditorAnalysisReport' }]
    },
    {
      title: 'Six Weeks Report',
      reports: [{ label: 'Six Weeks', href: '/SixWeeks_Report' }]
    },
    {
      title: 'Sale Rep Commission Report',
      reports: [
        { label: 'Sale Rep Commission', href: '/SaleRepCommissionReport' },
        { label: 'Sale Rep Commission By Product', href: '/SaleRepCommissionByProductReport' }
      ]
    },
    {
      title: 'Statements Report',
      reports: [
        { label: 'Current Debort Statement', href: '/CurrentDebtorsStatementReport' },
        { label: 'Perivous Debort Statement', href: '/PerviousDebtorsStatementReport' },
        { label: 'Current Creditor Statement', href: '/CurrentCreditorStatementReport' },
        { label: 'Perivous Creditor Statement', href: '/PerviousCreditorStatementReport' }
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
                  <Link href={item.href} passHref>
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
