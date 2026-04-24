'use client'

import { toast } from 'react-toastify'

export const toastAddedToCart = (name: string) =>
  toast.success(`${name} añadido al carrito`)

export const toastRemovedFromCart = (name: string) =>
  toast.info(`${name} eliminado del carrito`)

export const toastAddedToFavorites = (name: string) =>
  toast.success(`${name} guardado en favoritos`)

export const toastRemovedFromFavorites = (name: string) =>
  toast.info(`${name} eliminado de favoritos`)
