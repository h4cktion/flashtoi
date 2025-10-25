'use client'

import Image from 'next/image'
import { Photo } from '@/types'
import { useCartStore } from '@/lib/stores/cart-store'
import { useState } from 'react'

interface PhotoCardProps {
  photo: Photo
  index: number
}

export function PhotoCard({ photo, index }: PhotoCardProps) {
  const addToCart = useCartStore((state) => state.addToCart)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart({
      photoUrl: photo.cloudFrontUrl,
      format: photo.format,
      unitPrice: photo.price,
    })

    // Feedback visuel
    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-100">
        <Image
          src={photo.cloudFrontUrl}
          alt={`Photo ${index + 1}`}
          fill
          className="object-cover"
        />
      </div>

      {/* Infos photo */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-gray-600">Format {photo.format}</p>
            <p className="text-xs text-gray-500">{photo.planche}</p>
          </div>
          <p className="text-xl font-bold text-blue-600">
            {photo.price.toFixed(2)} €
          </p>
        </div>

        {/* Bouton ajouter au panier */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full font-medium py-2.5 rounded transition-colors ${
            isAdding
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isAdding ? '✓ Ajouté' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}
