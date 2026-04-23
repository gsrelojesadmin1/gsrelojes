'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Product } from '@/lib/types'

interface FavoritesContextType {
  favorites: Product[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (product: Product) => void
  removeFavorite: (id: string) => void
  clearFavorites: () => void
  totalFavorites: number
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gs-relojes-favorites')
      if (stored) setFavorites(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('gs-relojes-favorites', JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = useCallback(
    (id: string) => favorites.some(p => p.id === id),
    [favorites]
  )

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    )
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(p => p.id !== id))
  }, [])

  const clearFavorites = useCallback(() => setFavorites([]), [])

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
      totalFavorites: favorites.length,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
