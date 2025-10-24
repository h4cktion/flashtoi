'use client'

import { useCart } from './cart-context'

export function CartSummary() {
  const {
    cart,
    removeFromCart,
    removePackFromCart,
    updateQuantity,
    updatePackQuantity,
  } = useCart()

  if (cart.totalItems === 0) {
    return null
  }

  const hasItems = cart.items.length > 0
  const hasPacks = cart.packs.length > 0

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl p-4 border border-gray-200 min-w-[300px] max-w-[400px] max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Panier</h3>

      {/* Packs */}
      {hasPacks && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Packs</h4>
          <div className="space-y-2">
            {cart.packs.map((pack) => (
              <div
                key={pack.packId}
                className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded"
              >
                <div className="flex-1">
                  <div className="font-medium">Pack {pack.packName}</div>
                  <div className="text-gray-600 text-xs">
                    {pack.photos.length} photos - {pack.packPrice}€
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={pack.quantity}
                    onChange={(e) =>
                      updatePackQuantity(pack.packId, parseInt(e.target.value))
                    }
                    className="w-12 text-center border rounded px-1 py-0.5"
                  />
                  <button
                    onClick={() => removePackFromCart(pack.packId)}
                    className="text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos individuelles */}
      {hasItems && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">
            Photos individuelles
          </h4>
          <div className="space-y-2">
            {cart.items.map((item, index) => (
              <div
                key={`${item.photoUrl}-${item.format}-${index}`}
                className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.format}</div>
                  <div className="text-gray-600 text-xs">{item.unitPrice}€</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.photoUrl,
                        item.format,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-12 text-center border rounded px-1 py-0.5"
                  />
                  <button
                    onClick={() => removeFromCart(item.photoUrl, item.format)}
                    className="text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t pt-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {cart.totalItems} article{cart.totalItems > 1 ? 's' : ''}
          </span>
          <span className="text-xl font-bold text-blue-600">
            {cart.totalAmount.toFixed(2)} €
          </span>
        </div>
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
        Passer commande
      </button>
    </div>
  )
}
