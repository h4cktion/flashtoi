'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { PackCartItem } from '@/types'
import { useState } from 'react'

interface AddPackToCartButtonProps {
  pack: Omit<PackCartItem, 'quantity'>
}

export function AddPackToCartButton({ pack }: AddPackToCartButtonProps) {
  const addPackToCart = useCartStore((state) => state.addPackToCart)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addPackToCart(pack)
    setTimeout(() => setIsAdding(false), 1000)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 text-white text-sm ${
        isAdding
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-md'
          : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg'
      }`}
    >
      {isAdding ? '✓ Ajouté' : 'Ajouter au panier'}
    </button>
  )
}
