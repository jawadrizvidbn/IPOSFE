'use client'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation' // Import useRouter from next/navigation

import { useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import styles from '@core/styles/table.module.css'

const BasicDataTables = () => {
  const router = useRouter() // Use useRouter from next/navigation
  const shopKey = useSelector(state => state.shopKey) // Fetch shopKey from Redux store

  const handleCardClick = () => {
    router.push('/another-page') // Replace '/another-page' with your actual route
  }

  return (
    <Card>
      <div className='flex justify-center'>
        <CardHeader
          title={
            <div className='font-semibold text-primary'>
              <span className='text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'>
                {' '}
                {`${shopKey.toUpperCase()} Store Reports`}
              </span>
            </div>
          }
          className='gap-2 flex-col items-start sm:flex-row sm:items-center text-center'
          titleTypographyProps={{
            style: {
              margin: 0,
              fontFamily: '__Inter_10a487',
              lineHeight: '4.5556',
              color: 'rgb(92 71 129 / 90%)',
              display: 'block'
            }
          }}
          sx={{
            '& .MuiCardHeader-action': { m: 0 }
          }}
        />
      </div>
      <div className='flex flex-wrap justify-center m-3'>
        <Link href='/item_sales_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Item Sales Reports
          </button>
        </Link>
        <Link href='/item_daliy_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Daily Sales Reports
          </button>
        </Link>
        <Link href='/cashup_sales_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Cashup Reports
          </button>
        </Link>
        <Link href='/current_invoices_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Current invoices
          </button>
        </Link>
        <Link href='/refunds_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Refunds Reports
          </button>
        </Link>
        <Link href='/adjustment_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Adjustment Reports
          </button>
        </Link>
        <Link href='/grv_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            GRV Reports
          </button>
        </Link>
        <Link href='/grv2_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            GRV2 Reports
          </button>
        </Link>
        <Link href='/Void_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            VOID Reports
          </button>
        </Link>
        <Link href='/PriceChange_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Price Change Reports
          </button>
        </Link>
        <Link href='/payout_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Payout Reports
          </button>
        </Link>
        <Link href='/StockActivity_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Stock Activity Reports
          </button>
        </Link>
        <Link href='/DebtorsCreditNotes_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Debtors Credit Notes Reports
          </button>
        </Link>
        <Link href='/DebtorsDebitNotes_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Debtors Debit Notes Reports
          </button>
        </Link>
        <Link href='/DebtorsInvoices_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Debtors Invoices Reports
          </button>
        </Link>
        <Link href='/DebtorsPayment_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Debtors Payments Reports
          </button>
        </Link>
        <Link href='/CreditorsCreditNotes_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Creditors Credit Notes Reports
          </button>
        </Link>
        <Link href='/CreditorsDebitNotes_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Creditors Debit Notes Reports
          </button>
        </Link>
        <Link href='/CreditorsInvoices_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Creditors Invoices Reports
          </button>
        </Link>
        <Link href='/CreditorPayment_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Creditors Payments Reports
          </button>
        </Link>
        <Link href='/StockOnHand_Report'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
            Stock On Hand Reports
          </button>
        </Link>
        <Link href='/HistoryInvoicesByStation_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
          Invoices By Station
          </button>
        </Link>
        <Link href='/InvoicesByClerk_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
          Invoices By Clerk
          </button>
        </Link>
        <Link href='/CachupReportByClerk_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
          Cachup Report By Clerk 
          </button>
        </Link>
        <Link href='/StockValue_Report'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
          Stock Value Report  
          </button>
        </Link>
        <Link href='/DebtorsValue_Report'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
          Debtors Value Report 
          </button>
        </Link>
        <Link href='/CreditorsValue_Report'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
          Creditors Value Report
          </button>
        </Link>
        <Link href='/productBySaleInvoice_dump_data'>
          <button className='mr-4 mb-4 bg-purple-500 text-white py-4 px-6 rounded hover:bg-purple-600 text-lg sm:py-6 sm:px-8 lg:py-8 lg:px-10'>
          History Product Sale By Invoice Report
          </button>
        </Link>
      </div>
    </Card>
  )
}

export default BasicDataTables
