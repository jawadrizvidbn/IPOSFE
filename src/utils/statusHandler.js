import { isRejectedWithValue, isRejected, isPending, isFulfilled } from '@reduxjs/toolkit'

export const statusHandlerEnahncer = cs => (reducer, initialState, enhancer) => {
  const statusHandlerReducer = (state, action) => {
    const newState = reducer(state, action)

    //get slicename and type value from action.type
    const [sliceName, type] = action.type.split('/')
    let status

    //change newsState based on the sliceName, type and the status conveyed by the action
    if (isPending(action)) status = 'loading'
    else if (isFulfilled(action)) status = 'idle'
    else if (isRejected(action) || isRejectedWithValue(action)) status = 'failed'

    if (status)
      return {
        ...newState,
        [sliceName]: { ...newState[sliceName], [type + 'Status']: status }
      }

    return newState
  }

  return cs(statusHandlerReducer, initialState, enhancer)
}

export const thunkStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  FAILED: 'failed'
}
