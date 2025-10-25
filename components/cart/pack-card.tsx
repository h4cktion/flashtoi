'use client'

import Image from 'next/image'
import { Pack } from '@/types'
import { useCartStore } from '@/lib/stores/cart-store'
import { useState } from 'react'

interface PackCardProps {
  pack: Pack
}

export function PackCard({ pack }: PackCardProps) {
  const addPackToCart = useCartStore((state) => state.addPackToCart)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addPackToCart({
      packId: pack.pack._id.toString(),
      packName: pack.pack.name,
      packPrice: pack.pack.price,
      photos: pack.photos,
    })
    setTimeout(() => setIsAdding(false), 500)
  }

  // Afficher jusqu'à 4 photos en aperçu
  const previewPhotos = pack.photos.slice(0, 4)

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors">
      {/* En-tête avec nom et prix */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Pack {pack.pack.name}</h3>
          <p className="text-2xl font-bold">{pack.pack.price}€</p>
        </div>
        <p className="text-blue-100 text-sm mt-2">{pack.pack.description}</p>
        <p className="text-blue-100 text-xs mt-1">
          {pack.photos.length} photo{pack.photos.length > 1 ? 's' : ''} incluse{pack.photos.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Aperçu des photos */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {previewPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 rounded overflow-hidden"
            >
              <Image
                src={photo.cloudFrontUrl}
                alt={`Photo ${photo.planche}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>

        {pack.photos.length > 4 && (
          <p className="text-center text-sm text-gray-500 mb-3">
            + {pack.photos.length - 4} autre{pack.photos.length - 4 > 1 ? 's' : ''} photo{pack.photos.length - 4 > 1 ? 's' : ''}
          </p>
        )}

        {/* Bouton d'ajout au panier */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full py-2.5 rounded font-medium transition-colors ${
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
