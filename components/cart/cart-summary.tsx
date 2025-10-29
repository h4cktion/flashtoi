'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { CartItem, PackCartItem } from '@/types'

interface GroupedItems {
  [studentId: string]: {
    studentName: string
    items: CartItem[]
    packs: PackCartItem[]
    total: number
  }
}

export function CartSummary() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const packs = useCartStore((state) => state.packs)
  const totalItems = useCartStore((state) => state.totalItems)
  const totalAmount = useCartStore((state) => state.totalAmount)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const removePackFromCart = useCartStore((state) => state.removePackFromCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const updatePackQuantity = useCartStore((state) => state.updatePackQuantity)

  // Grouper les items par élève
  const groupedItems = useMemo(() => {
    const grouped: GroupedItems = {}

    // Grouper les photos individuelles
    items.forEach((item) => {
      if (!grouped[item.studentId]) {
        grouped[item.studentId] = {
          studentName: item.studentName,
          items: [],
          packs: [],
          total: 0,
        }
      }
      grouped[item.studentId].items.push(item)
      grouped[item.studentId].total += item.unitPrice * item.quantity
    })

    // Grouper les packs
    packs.forEach((pack) => {
      if (!grouped[pack.studentId]) {
        grouped[pack.studentId] = {
          studentName: pack.studentName,
          items: [],
          packs: [],
          total: 0,
        }
      }
      grouped[pack.studentId].packs.push(pack)
      grouped[pack.studentId].total += pack.packPrice * pack.quantity
    })

    return grouped
  }, [items, packs])

  if (totalItems === 0) {
    return null
  }

  const studentIds = Object.keys(groupedItems)

  return (
    <div className="hidden md:block fixed bottom-6 right-6 bg-white rounded-lg shadow-xl p-4 border border-gray-200 min-w-[350px] max-w-[450px] max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-3 pb-3 border-b">Panier</h3>

      {/* Affichage groupé par élève */}
      <div className="space-y-4 mb-4">
        {studentIds.map((studentId) => {
          const group = groupedItems[studentId]
          const hasItems = group.items.length > 0
          const hasPacks = group.packs.length > 0

          return (
            <div
              key={studentId}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              {/* Nom de l'élève */}
              <div className="font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-300">
                {group.studentName}
              </div>

              {/* Packs de l'élève */}
              {hasPacks && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-gray-600 mb-1 uppercase">
                    Packs
                  </h5>
                  <div className="space-y-2">
                    {group.packs.map((pack) => (
                      <div
                        key={`${pack.packId}-${pack.studentId}`}
                        className="flex items-center justify-between text-sm bg-white p-2 rounded border border-blue-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            Pack {pack.packName}
                          </div>
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
                              updatePackQuantity(
                                pack.packId,
                                pack.studentId,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-12 text-center border rounded px-1 py-0.5"
                          />
                          <button
                            onClick={() =>
                              removePackFromCart(pack.packId, pack.studentId)
                            }
                            className="text-red-500 hover:text-red-700 text-lg"
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

              {/* Photos individuelles de l'élève */}
              {hasItems && (
                <div className="mb-2">
                  <h5 className="text-xs font-semibold text-gray-600 mb-1 uppercase">
                    Photos individuelles
                  </h5>
                  <div className="space-y-2">
                    {group.items.map((item, index) => (
                      <div
                        key={`${item.photoUrl}-${item.format}-${item.studentId}-${index}`}
                        className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {item.format}
                          </div>
                          <div className="text-gray-600 text-xs">
                            {item.unitPrice}€
                          </div>
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
                                item.studentId,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-12 text-center border rounded px-1 py-0.5"
                          />
                          <button
                            onClick={() =>
                              removeFromCart(
                                item.photoUrl,
                                item.format,
                                item.studentId
                              )
                            }
                            className="text-red-500 hover:text-red-700 text-lg"
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

              {/* Sous-total par élève */}
              <div className="flex justify-between items-center text-sm font-semibold text-gray-700 mt-2 pt-2 border-t border-gray-300">
                <span>Sous-total</span>
                <span>{group.total.toFixed(2)} €</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total général */}
      <div className="border-t pt-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {totalItems} article{totalItems > 1 ? 's' : ''}
          </span>
          <span className="text-xl font-bold text-[#192F84]">
            {totalAmount.toFixed(2)} €
          </span>
        </div>
      </div>

      <button
        onClick={() => router.push('/checkout')}
        className="w-full bg-[#192F84] hover:bg-[#1a3699] text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Passer commande
      </button>
    </div>
  )
}
