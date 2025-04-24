'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'

export function AuthInitializer({ children }) {
  const dispatch = useDispatch()
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) dispatch(setCredentials(token))
  }, [dispatch])
  return <>{children}</>
}