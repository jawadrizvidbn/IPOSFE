// src/components/ExampleComponent.js
'use client'

import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { increment, decrement } from '../redux/reducers/exampleReducer'

const ExampleComponent = () => {
  const value = useSelector(state => state.example.value)
  const dispatch = useDispatch()

  return (
    <div>
      <p>Value: {value}</p>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
    </div>
  )
}

export default ExampleComponent
