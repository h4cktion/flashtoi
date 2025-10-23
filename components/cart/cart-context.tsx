'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CartItem, Cart } from '@/types'

interface CartContextType {
  cart: Cart
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (photoUrl: string, format: string) => void
  clearCart: () => void
  updateQuantity: (photoUrl: string, format: string, quantity: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
  })

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      // Vérifier si l'item existe déjà
      const existingIndex = prevCart.items.findIndex(
        (i) => i.photoUrl === item.photoUrl && i.format === item.format
      )

      let newItems: CartItem[]

      if (existingIndex >= 0) {
        // Incrémenter la quantité
        newItems = [...prevCart.items]
        newItems[existingIndex].quantity += 1
      } else {
        // Ajouter un nouvel item
        newItems = [...prevCart.items, { ...item, quantity: 1 }]
      }

      // Recalculer les totaux
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )

      return {
        items: newItems,
        totalItems,
        totalAmount,
      }
    })
  }

  const removeFromCart = (photoUrl: string, format: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) => !(item.photoUrl === photoUrl && item.format === format)
      )

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )

      return {
        items: newItems,
        totalItems,
        totalAmount,
      }
    })
  }

  const updateQuantity = (photoUrl: string, format: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(photoUrl, format)
      return
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.photoUrl === photoUrl && item.format === format
          ? { ...item, quantity }
          : item
      )

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalAmount = newItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )

      return {
        items: newItems,
        totalItems,
        totalAmount,
      }
    })
  }

  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalAmount: 0,
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
