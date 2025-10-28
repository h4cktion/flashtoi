import { getStudentById } from '@/lib/actions/student'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AddPhotoToCartButton } from '@/components/cart/add-photo-to-cart-button'

interface PhotoDetailPageProps {
  params: Promise<{
    id: string
    photoIndex: string
  }>
}

export default async function PhotoDetailPage({ params }: PhotoDetailPageProps) {
  const { id, photoIndex } = await params
  const index = parseInt(photoIndex)

  // Récupérer l'étudiant
  const studentResult = await getStudentById(id)

  if (!studentResult.success || !studentResult.data) {
    notFound()
  }

  const student = studentResult.data

  // Vérifier que l'index est valide
  if (isNaN(index) || index < 0 || index >= student.photos.length) {
    redirect(`/gallery/${id}`)
  }

  const photo = student.photos[index]

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header avec retour */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/gallery/${id}`}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm">← retour</span>
          </Link>

          <h1 className="text-lg font-bold text-gray-900">
            {photo.format}
          </h1>

          <div className="w-16" />
        </div>

        {/* Photo grande */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={photo.cloudFrontUrl}
              alt={`Photo ${photo.format}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
        </div>

        {/* Footer avec infos et bouton */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Format</p>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {photo.format}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {photo.planche}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {photo.price.toFixed(2)} €
              </p>
            </div>

            <AddPhotoToCartButton photo={photo} />
          </div>
        </div>

        {/* Info étudiant */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Photo de {student.firstName} {student.lastName}
        </p>
      </div>
    </div>
  )
}
