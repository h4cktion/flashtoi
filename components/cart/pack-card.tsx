'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Pack } from '@/types'
import { useParams } from 'next/navigation'

interface PackCardProps {
  pack: Pack
  studentId?: string
  studentName?: string
}

export function PackCard({ pack, studentId: propsStudentId }: PackCardProps) {
  const params = useParams()
  const urlStudentId = params.id as string
  const studentId = propsStudentId || urlStudentId

  // Afficher TOUTES les photos dans l'aperçu
  const totalPhotos = pack.photos.length
  const photoWidth = 110
  const photoHeight = 132
  const horizontalSpacing = 12

  // Calculer la largeur totale nécessaire pour toutes les photos
  const totalWidth = photoWidth + (totalPhotos - 1) * horizontalSpacing

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Aperçu visuel du pack avec TOUTES les photos empilées */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center overflow-hidden">
        <div className="relative" style={{ width: `${totalWidth}px`, height: `${photoHeight}px` }}>
          {pack.photos.map((photo, index) => (
            <div
              key={index}
              className="absolute bg-white rounded-lg shadow-lg overflow-hidden border-2 border-white flex items-center justify-center"
              style={{
                width: `${photoWidth}px`,
                height: `${photoHeight}px`,
                transform: `translate(${index * horizontalSpacing}px, ${index * -6}px) rotate(${(index % 3) * 3 - 3}deg)`,
                zIndex: pack.photos.length - index,
              }}
            >
              <Image
                src={photo.cloudFrontUrl}
                alt={`Preview ${index + 1}`}
                fill
                className="object-contain"
                sizes="110px"
              />
              <div className="absolute bottom-1 left-1 bg-white px-1.5 py-0.5 rounded text-xs font-semibold text-gray-700">
                {photo.format}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infos du pack */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Pack {pack.pack.name}
            </h3>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                {pack.pack.price.toFixed(2)} €
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {pack.photos.length} photo{pack.photos.length > 1 ? 's' : ''} incluse{pack.photos.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Bouton VOIR réduit à droite */}
          <Link
            href={`/gallery/${studentId}/pack/${pack.pack._id}`}
            className="px-4 py-2 rounded-lg font-medium text-center transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg text-white flex-shrink-0 text-sm"
          >
            VOIR
          </Link>
        </div>
      </div>
    </div>
  )
}
