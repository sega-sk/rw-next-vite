'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../../services/auth'

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    const handleLogout = () => {
      setUser(null)
      setIsLoading(false)
    }

    authService.setOnLogout(handleLogout)
    checkAuth()

    return () => {
      authService.setOnLogout(() => {})
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      await authService.login({ email, password })
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}