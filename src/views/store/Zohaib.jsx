'use client'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation' // Import useRouter from next/navigation

import { useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import styles from '@core/styles/table.module.css'

const Zohaib = () => {
  const router = useRouter() // Use useRouter from next/navigation
  const shopKey = useSelector(state => state.shopKey) // Fetch shopKey from Redux store

  const handleCardClick = () => {
    router.push('/another-page') // Replace '/another-page' with your actual route
  }

  return (
    <Card>
      <h4>Zohaib Component</h4>
    </Card>
  )
}

export default Zohaib
