'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { createOrder } from '@/lib/actions/order'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentMethod } from '@/types'
import { useSession } from 'next-auth/react'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const items = useCartStore((state) => state.items)
  const packs = useCartStore((state) => state.packs)
  const totalAmount = useCartStore((state) => state.totalAmount)
  const clearCart = useCartStore((state) => state.clearCart)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Vérifier l'authentification
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !session?.user?.studentId) {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user?.studentId) {
    return null
  }

  const handleSubmitOrder = async () => {
    if (!paymentMethod || paymentMethod === '') {
      setError('Veuillez sélectionner un mode de paiement')
      return
    }

    if (paymentMethod === 'online') {
      setError('Le paiement en ligne sera bientôt disponible')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (!session?.user?.studentId) {
        setError('Session expirée, veuillez vous reconnecter')
        return
      }

      // Préparer les données de la commande
      const orderData = {
        studentId: session.user.studentId,
        items: items.map((item) => ({
          photoUrl: item.photoUrl,
          format: item.format,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        })),
        packs: packs.map((pack) => ({
          packId: pack.packId,
          packName: pack.packName,
          packPrice: pack.packPrice,
          quantity: pack.quantity,
          subtotal: pack.packPrice * pack.quantity,
          photosCount: pack.photos.length,
        })),
        totalAmount,
        paymentMethod: paymentMethod as PaymentMethod,
        notes: notes.trim() || undefined,
      }

      const result = await createOrder(orderData)

      if (result.success) {
        // Vider le panier
        clearCart()

        // Rediriger vers la page de confirmation
        router.push(`/order-confirmation?orderNumber=${result.data?.orderNumber}`)
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    } catch (err) {
      console.error('Error submitting order:', err)
      setError('Une erreur est survenue lors de la création de la commande')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0 && packs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-6">
              Ajoutez des photos à votre panier pour passer commande
            </p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
            >
              Retour à la galerie
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finaliser la commande
          </h1>
          <p className="text-gray-600">
            Vérifiez votre commande et choisissez votre mode de paiement
          </p>
        </div>

        {/* Récapitulatif de la commande */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>

          {/* Packs */}
          {packs.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Packs</h3>
              <div className="space-y-2">
                {packs.map((pack) => (
                  <div
                    key={pack.packId}
                    className="flex justify-between text-sm bg-blue-50 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium">Pack {pack.packName}</p>
                      <p className="text-gray-600 text-xs">
                        {pack.photos.length} photos × {pack.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {(pack.packPrice * pack.quantity).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos individuelles */}
          {items.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">
                Photos individuelles
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={`${item.photoUrl}-${item.format}-${index}`}
                    className="flex justify-between text-sm bg-gray-50 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium">{item.format}</p>
                      <p className="text-gray-600 text-xs">
                        {item.unitPrice.toFixed(2)} € × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {(item.unitPrice * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                {totalAmount.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Mode de paiement */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Mode de paiement</h2>

          <div className="space-y-3">
            {/* Chèque */}
            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="check"
                checked={paymentMethod === 'check'}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Chèque</p>
                <p className="text-sm text-gray-600 mt-1">
                  Payez par chèque à l&apos;ordre de l&apos;école
                </p>
              </div>
            </label>

            {/* Liquide */}
            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Espèces</p>
                <p className="text-sm text-gray-600 mt-1">
                  Payez en espèces directement à l&apos;école
                </p>
              </div>
            </label>

            {/* Stripe (désactivé) */}
            <label className="flex items-start p-4 border rounded-lg opacity-50 cursor-not-allowed bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                disabled
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Paiement en ligne (bientôt disponible)
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Payez en ligne par carte bancaire via Stripe
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes (optionnel)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des informations complémentaires pour votre commande..."
            rows={4}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded transition-colors"
            disabled={isLoading}
          >
            Retour
          </button>
          <button
            onClick={handleSubmitOrder}
            disabled={isLoading || !paymentMethod}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Création en cours...' : 'Confirmer la commande'}
          </button>
        </div>
      </div>
    </div>
  )
}
