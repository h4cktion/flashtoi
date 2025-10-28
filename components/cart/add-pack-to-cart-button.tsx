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
      className={`px-8 py-3 rounded-lg font-semibold transition-colors text-white ${
        isAdding
          ? 'bg-green-500'
          : 'bg-[#192F84] hover:bg-[#1a3699]'
      }`}
    >
      {isAdding ? '✓ Ajouté' : 'Ajouter au panier'}
    </button>
  )
}
