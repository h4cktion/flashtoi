import { getStudentById } from '@/lib/actions/student'
import { getAvailablePacksForStudent } from '@/lib/actions/pack'
import { notFound } from 'next/navigation'
import { PhotoCard } from '@/components/cart/photo-card'
import { CartSummary } from '@/components/cart/cart-summary'
import { PacksSection } from '@/components/cart/packs-section'

interface GalleryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { id } = await params

  // Récupérer l'étudiant et les packs disponibles en parallèle
  const [studentResult, packsResult] = await Promise.all([
    getStudentById(id),
    getAvailablePacksForStudent(id),
  ])

  if (!studentResult.success || !studentResult.data) {
    notFound()
  }

  const student = studentResult.data
  const packs = packsResult.success ? packsResult.data || [] : []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Photos de {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-600 mt-2">Classe: {student.classId}</p>
        </div>

        {/* Section des packs */}
        <PacksSection packs={packs} />

        {/* Galerie de photos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Photos individuelles</h2>

          {student.photos && student.photos.length > 0 ? (
            <div className="flex flex-col gap-6">
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
