'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getStudentById } from '@/lib/actions/student'
import { getAvailablePacksForStudent } from '@/lib/actions/pack'
import { IStudent, Pack } from '@/types'
import { PhotoCard } from '@/components/cart/photo-card'
import { CartSummary } from '@/components/cart/cart-summary'
import { MobileCartButton } from '@/components/cart/mobile-cart-button'
import { PacksSection } from '@/components/cart/packs-section'
import { AddStudentForm } from '@/components/gallery/add-student-form'
import { StudentTabs } from '@/components/gallery/student-tabs'
import { useStudentsStore } from '@/lib/stores/students-store'

export default function GalleryPage() {
  const params = useParams()
  const id = params.id as string

  const [mounted, setMounted] = useState(false)
  const students = useStudentsStore((state) => state.students)
  const activeStudentIndex = useStudentsStore((state) => state.activeStudentIndex)
  const addStudent = useStudentsStore((state) => state.addStudent)

  const [currentStudent, setCurrentStudent] = useState<IStudent | null>(null)
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Éviter les erreurs d'hydration avec Zustand
  useEffect(() => {
    setMounted(true)
  }, [])

  // Charger l'élève initial (depuis l'URL) au premier montage
  useEffect(() => {
    const loadInitialStudent = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getStudentById(id)

        if (!result.success || !result.data) {
          setError(result.error || 'Élève non trouvé')
          return
        }

        // Ajouter l'élève au store s'il n'est pas déjà ajouté
        if (students.length === 0) {
          addStudent(result.data)
        }

        setCurrentStudent(result.data)

        // Charger les packs
        const packsResult = await getAvailablePacksForStudent(id)
        setPacks(packsResult.success && packsResult.data ? packsResult.data : [])
      } catch (err) {
        console.error('Error loading student:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadInitialStudent()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Charger l'élève actif quand il change
  useEffect(() => {
    const loadActiveStudent = async () => {
      if (students.length === 0) return

      const activeStudent = students[activeStudentIndex]
      if (!activeStudent) return

      // Ne pas recharger si c'est déjà l'élève actuel
      if (currentStudent && currentStudent._id.toString() === activeStudent.id) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [studentResult, packsResult] = await Promise.all([
          getStudentById(activeStudent.id),
          getAvailablePacksForStudent(activeStudent.id),
        ])

        if (!studentResult.success || !studentResult.data) {
          setError(studentResult.error || 'Élève non trouvé')
          return
        }

        setCurrentStudent(studentResult.data)
        setPacks(
          packsResult.success && packsResult.data ? packsResult.data : []
        )
      } catch (err) {
        console.error('Error loading active student:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadActiveStudent()
  }, [activeStudentIndex, students, currentStudent])

  if (loading && !currentStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#192F84] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error && !currentStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!currentStudent) {
    return null
  }

  // Ne pas afficher les composants Zustand avant le montage pour éviter les erreurs d'hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#192F84] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Formulaire d'ajout d'élève */}
        <AddStudentForm />

        {/* Tabs des élèves */}
        <StudentTabs />

        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Photos de {currentStudent.firstName} {currentStudent.lastName}
          </h1>
          <p className="text-gray-600 mt-2">Classe: {currentStudent.classId}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#192F84] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des photos...</p>
          </div>
        ) : (
          <>
            {/* Section des packs */}
            <PacksSection
              packs={packs}
              studentId={currentStudent._id.toString()}
              studentName={`${currentStudent.firstName} ${currentStudent.lastName}`}
            />

            {/* Galerie de photos */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-xl font-semibold mb-4">
                Photos individuelles
              </h2>

              {currentStudent.photos && currentStudent.photos.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {currentStudent.photos.map((photo, index) => (
                    <PhotoCard
                      key={index}
                      photo={photo}
                      index={index}
                      studentId={currentStudent._id.toString()}
                      studentName={`${currentStudent.firstName} ${currentStudent.lastName}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">
                  Aucune photo disponible pour le moment
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Résumé du panier (flottant sur desktop uniquement) */}
      <CartSummary />

      {/* Bouton panier mobile (fixe en haut à droite) */}
      <MobileCartButton />
    </div>
  )
}
