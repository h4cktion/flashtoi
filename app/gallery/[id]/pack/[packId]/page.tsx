import { getStudentById } from '@/lib/actions/student'
import { getAvailablePacksForStudent } from '@/lib/actions/pack'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AddPackToCartButton } from '@/components/cart/add-pack-to-cart-button'

interface PackDetailPageProps {
  params: Promise<{
    id: string
    packId: string
  }>
}

export default async function PackDetailPage({ params }: PackDetailPageProps) {
  const { id, packId } = await params

  // Récupérer l'étudiant et les packs disponibles
  const [studentResult, packsResult] = await Promise.all([
    getStudentById(id),
    getAvailablePacksForStudent(id),
  ])

  if (!studentResult.success || !studentResult.data) {
    notFound()
  }

  if (!packsResult.success || !packsResult.data) {
    redirect(`/gallery/${id}`)
  }

  // Trouver le pack spécifique
  const pack = packsResult.data.find((p) => p.pack._id === packId)

  if (!pack) {
    redirect(`/gallery/${id}`)
  }

  const student = studentResult.data

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
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

          <h1 className="text-2xl font-bold text-gray-900 font-cursive">
            Pack {pack.pack.name}
          </h1>

          <div className="w-16" />
        </div>

        {/* Photos du pack en grille */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pack.photos.map((photo, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                <div className="relative aspect-[3/4] bg-gray-100">
                  <Image
                    src={photo.cloudFrontUrl}
                    alt={`Photo ${photo.planche}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="p-3 bg-white">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-900 font-semibold">
                      {photo.format}
                    </p>
                    <span className="text-sm text-[#192F84] font-bold">
                      x 1
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer avec prix et bouton */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {pack.photos.length} photo{pack.photos.length > 1 ? 's' : ''} incluse{pack.photos.length > 1 ? 's' : ''}
              </p>
              <p className="text-3xl font-bold text-green-600">
                {pack.pack.price.toFixed(2)} €
              </p>
            </div>

            <AddPackToCartButton
              pack={{
                packId: pack.pack._id.toString(),
                packName: pack.pack.name,
                packPrice: pack.pack.price,
                photos: pack.photos,
                studentId: id,
                studentName: `${student.firstName} ${student.lastName}`,
              }}
            />
          </div>
        </div>

        {/* Info étudiant */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Pack pour {student.firstName} {student.lastName}
        </p>
      </div>
    </div>
  )
}
