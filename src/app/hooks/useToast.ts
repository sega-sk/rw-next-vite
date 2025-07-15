import { useState, useCallback } from 'react'

export const useToast = () => {
  const success = useCallback((title: string, message?: string) => {
    console.log('Success:', title, message)
  }, [])

  const error = useCallback((title: string, message?: string) => {
    console.log('Error:', title, message)
  }, [])

  const warning = useCallback((title: string, message?: string) => {
    console.log('Warning:', title, message)
  }, [])

  const info = useCallback((title: string, message?: string) => {
    console.log('Info:', title, message)
  }, [])

  return { success, error, warning, info }
}