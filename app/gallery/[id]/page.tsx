import { getStudentById } from '@/lib/actions/student'
import { notFound } from 'next/navigation'
import { PhotoCard } from '@/components/cart/photo-card'
import { CartSummary } from '@/components/cart/cart-summary'

interface GalleryPageProps {
  params: {
    id: string
  }
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { id } = params
  const result = await getStudentById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const student = result.data

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Photos de {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-600 mt-2">Classe: {student.classId}</p>
        </div>

        {/* Galerie de photos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Vos photos</h2>

          {student.photos && student.photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {student.photos.map((photo, index) => (
                <PhotoCard key={index} photo={photo} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">
              Aucune photo disponible pour le moment
            </p>
          )}
        </div>
      </div>

      {/* Résumé du panier (flottant) */}
      <CartSummary />
    </div>
  )
}
