'use client'

import Image from 'next/image'
import { Photo } from '@/types'
import { useCart } from './cart-context'
import { useState } from 'react'

interface PhotoCardProps {
  photo: Photo
  index: number
}

export function PhotoCard({ photo, index }: PhotoCardProps) {
  const { addToCart } = useCart()
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
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
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
          <span className="text-sm font-medium text-gray-700">
            Format: {photo.format}
          </span>
          <span className="text-lg font-bold text-blue-600">
            {photo.price.toFixed(2)} €
          </span>
        </div>

        {/* Bouton ajouter au panier */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full font-medium py-2 px-4 rounded transition-colors ${
            isAdding
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isAdding ? '✓ Ajouté !' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}
