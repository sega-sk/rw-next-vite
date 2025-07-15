'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface FavoritesContextType {
  favorites: string[]
  addToFavorites: (productId: string) => void
  removeFromFavorites: (productId: string) => void
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const savedFavorites = localStorage.getItem('reel-wheels-favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('reel-wheels-favorites', JSON.stringify(favorites))
  }, [favorites])

  const addToFavorites = (productId: string) => {
    setFavorites(prev => [...prev.filter(id => id !== productId), productId])
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites(prev => prev.filter(id => id !== productId))
  }

  const isFavorite = (productId: string) => {
    return favorites.includes(productId)
  }

  const toggleFavorite = (productId: string) => {
    if (isFavorite(productId)) {
      removeFromFavorites(productId)
    } else {
      addToFavorites(productId)
    }
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}