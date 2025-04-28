// src/components/ClientProvider.js
'use client'

import { Provider } from 'react-redux'

import { PersistGate } from 'redux-persist/integration/react'

import store, { persistor } from '../redux/store'
import { getSession } from 'next-auth/react'
import { getUserById, setCurrentUser } from '@/redux/reducers/authSlice'
import { setCurrentStore } from '@/redux/reducers/dashboardSlice'

const ClientProvider = ({ children }) => {
  const handleBeforeLift = async () => {
    const session = await getSession()
    const user = await store.dispatch(getUserById(session?.user?.id))
    const updatedUser = { ...(session?.user || user || {}), ...user.payload }

    store.dispatch(setCurrentUser(updatedUser))
    store.dispatch(setCurrentStore(updatedUser?.allowedStores?.[0] || ''))
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} onBeforeLift={handleBeforeLift}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default ClientProvider
