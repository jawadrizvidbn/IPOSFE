import { isRejectedWithValue, isRejected } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

//handles errors from thunks
export const errorHandlerMiddleware = () => next => action => {
  let error = null

  if (isRejected(action)) {
    error = { ...action.error, message: action.error.message }
  } else if (isRejectedWithValue(action)) {
    error = { payload: action.payload, message: action.payload?.message }
  }
  if (error) globalErrorHandler(error)

  return next(action)
}

export const globalErrorHandler = error => {
  console.log(error)
  if (typeof error === 'string') error = { message: error }
  error.message = error.message || 'An unknown error occurred!'
  toast.error(error.message)
}
