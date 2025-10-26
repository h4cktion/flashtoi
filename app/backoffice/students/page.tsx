import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getAllStudentsForAdmin } from '@/lib/actions/admin'
import { StudentsTable } from '@/components/backoffice/students-table'
import Link from 'next/link'

export default async function BackofficeStudentsPage() {
  // Vérifier l'authentification
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/backoffice/login')
  }

  // Récupérer les étudiants
  const result = await getAllStudentsForAdmin()

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              Erreur lors du chargement des étudiants: {result.error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { students } = result.data

  // Calculer les statistiques
  const studentsWithOrder = students.filter((s) => s.hasOrder)
  const studentsWithoutOrder = students.filter((s) => !s.hasOrder)
  const totalRevenue = students.reduce((sum, s) => sum + (s.orderAmount ?? 0), 0)

  // Grouper par école
  const schoolGroups = students.reduce((acc, student) => {
    if (!acc[student.schoolName]) {
      acc[student.schoolName] = 0
    }
    acc[student.schoolName]++
    return acc
  }, {} as Record<string, number>)

  const totalSchools = Object.keys(schoolGroups).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des étudiants</h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble de tous les étudiants</p>
            </div>
            <Link
              href="/backoffice/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600">Total étudiants</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {students.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Dans {totalSchools} école(s)
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600">Avec commande</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {studentsWithOrder.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {students.length > 0
                ? `${Math.round((studentsWithOrder.length / students.length) * 100)}%`
                : '0%'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600">Sans commande</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">
              {studentsWithoutOrder.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {students.length > 0
                ? `${Math.round((studentsWithoutOrder.length / students.length) * 100)}%`
                : '0%'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600">
              Chiffre d'affaires
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(totalRevenue)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600">Moyenne / étudiant</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {studentsWithOrder.length > 0
                ? new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(totalRevenue / studentsWithOrder.length)
                : '0,00 €'}
            </div>
          </div>
        </div>

        {/* Students table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <StudentsTable students={students} />
        </div>
      </main>
    </div>
  )
}
