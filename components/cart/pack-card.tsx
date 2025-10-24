'use client'

import Image from 'next/image'
import { Pack } from '@/types'
import { useCart } from './cart-context'
import { useState } from 'react'

interface PackCardProps {
  pack: Pack
}

export function PackCard({ pack }: PackCardProps) {
  const { addPackToCart } = useCart()
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* En-tête avec nom et prix */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Pack {pack.pack.name}</h3>
          <div className="text-right">
            <p className="text-3xl font-bold">{pack.pack.price}€</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm mt-1">{pack.pack.description}</p>
      </div>

      {/* Aperçu des photos */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {previewPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 rounded-md overflow-hidden"
            >
              <Image
                src={photo.cloudFrontUrl}
                alt={`Photo ${photo.planche}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 text-center">
                {photo.planche}
              </div>
            </div>
          ))}
        </div>

        {/* Nombre de photos incluses */}
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">
            <span className="font-semibold">{pack.photos.length}</span> photo
            {pack.photos.length > 1 ? 's' : ''} incluse
            {pack.photos.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Bouton d'ajout au panier */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
            isAdding
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isAdding ? '✓ Ajouté au panier' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}
