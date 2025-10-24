'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CartItem, Cart, PackCartItem } from '@/types'

interface CartContextType {
  cart: Cart
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (photoUrl: string, format: string) => void
  addPackToCart: (pack: Omit<PackCartItem, 'quantity'>) => void
  removePackFromCart: (packId: string) => void
  updatePackQuantity: (packId: string, quantity: number) => void
  clearCart: () => void
  updateQuantity: (photoUrl: string, format: string, quantity: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    packs: [],
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
      const itemsTotal = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const packsTotal = prevCart.packs.reduce((sum, pack) => sum + pack.quantity, 0)
      const totalItems = itemsTotal + packsTotal

      const itemsAmount = newItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )
      const packsAmount = prevCart.packs.reduce(
        (sum, pack) => sum + pack.packPrice * pack.quantity,
        0
      )
      const totalAmount = itemsAmount + packsAmount

      return {
        items: newItems,
        packs: prevCart.packs,
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

      const itemsTotal = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const packsTotal = prevCart.packs.reduce((sum, pack) => sum + pack.quantity, 0)
      const totalItems = itemsTotal + packsTotal

      const itemsAmount = newItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )
      const packsAmount = prevCart.packs.reduce(
        (sum, pack) => sum + pack.packPrice * pack.quantity,
        0
      )
      const totalAmount = itemsAmount + packsAmount

      return {
        items: newItems,
        packs: prevCart.packs,
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

      const itemsTotal = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const packsTotal = prevCart.packs.reduce((sum, pack) => sum + pack.quantity, 0)
      const totalItems = itemsTotal + packsTotal

      const itemsAmount = newItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )
      const packsAmount = prevCart.packs.reduce(
        (sum, pack) => sum + pack.packPrice * pack.quantity,
        0
      )
      const totalAmount = itemsAmount + packsAmount

      return {
        items: newItems,
        packs: prevCart.packs,
        totalItems,
        totalAmount,
      }
    })
  }

  const addPackToCart = (pack: Omit<PackCartItem, 'quantity'>) => {
    setCart((prevCart) => {
      // Vérifier si le pack existe déjà
      const existingIndex = prevCart.packs.findIndex((p) => p.packId === pack.packId)

      let newPacks: PackCartItem[]

      if (existingIndex >= 0) {
        // Incrémenter la quantité
        newPacks = [...prevCart.packs]
        newPacks[existingIndex].quantity += 1
      } else {
        // Ajouter un nouveau pack
        newPacks = [...prevCart.packs, { ...pack, quantity: 1 }]
      }

      // Recalculer les totaux
      const itemsTotal = prevCart.items.reduce((sum, item) => sum + item.quantity, 0)
      const packsTotal = newPacks.reduce((sum, pack) => sum + pack.quantity, 0)
      const totalItems = itemsTotal + packsTotal

      const itemsAmount = prevCart.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )
      const packsAmount = newPacks.reduce(
        (sum, pack) => sum + pack.packPrice * pack.quantity,
        0
      )
      const totalAmount = itemsAmount + packsAmount

      return {
        items: prevCart.items,
        packs: newPacks,
        totalItems,
        totalAmount,
      }
    })
  }

  const removePackFromCart = (packId: string) => {
    setCart((prevCart) => {
      const newPacks = prevCart.packs.filter((pack) => pack.packId !== packId)

      const itemsTotal = prevCart.items.reduce((sum, item) => sum + item.quantity, 0)
      const packsTotal = newPacks.reduce((sum, pack) => sum + pack.quantity, 0)
      const totalItems = itemsTotal + packsTotal

      const itemsAmount = prevCart.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )
      const packsAmount = newPacks.reduce(
        (sum, pack) => sum + pack.packPrice * pack.quantity,
        0
      )
      const totalAmount = itemsAmount + packsAmount

      return {
        items: prevCart.items,
        packs: newPacks,
        totalItems,
        totalAmount,
      }
    })
  }

  const updatePackQuantity = (packId: string, quantity: number) => {
    if (quantity <= 0) {
      removePackFromCart(packId)
      return
    }

    setCart((prevCart) => {
      const newPacks = prevCart.packs.map((pack) =>
        pack.packId === packId ? { ...pack, quantity } : pack
      )

      const itemsTotal = prevCart.items.reduce((sum, item) => sum + item.quantity, 0)
      const packsTotal = newPacks.reduce((sum, pack) => sum + pack.quantity, 0)
      const totalItems = itemsTotal + packsTotal

      const itemsAmount = prevCart.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )
      const packsAmount = newPacks.reduce(
        (sum, pack) => sum + pack.packPrice * pack.quantity,
        0
      )
      const totalAmount = itemsAmount + packsAmount

      return {
        items: prevCart.items,
        packs: newPacks,
        totalItems,
        totalAmount,
      }
    })
  }

  const clearCart = () => {
    setCart({
      items: [],
      packs: [],
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
        addPackToCart,
        removePackFromCart,
        updatePackQuantity,
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
