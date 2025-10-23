'use client'

import { useCart } from './cart-context'

export function CartSummary() {
  const { cart } = useCart()

  if (cart.totalItems === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl p-4 border border-gray-200 min-w-[200px]">
      <h3 className="font-bold text-lg mb-2">Panier</h3>
      <div className="text-sm text-gray-600 mb-2">
        {cart.totalItems} article{cart.totalItems > 1 ? 's' : ''}
      </div>
      <div className="text-xl font-bold text-blue-600 mb-3">
        {cart.totalAmount.toFixed(2)} €
      </div>
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
        Voir le panier
      </button>
    </div>
  )
}
