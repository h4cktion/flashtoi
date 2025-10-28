import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getSchoolDashboard } from '@/lib/actions/school'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { StudentsTable } from '@/components/school/students-table'
import Link from 'next/link'

export default async function SchoolDashboardPage() {
  // Vérifier l'authentification
  const session = await auth()

  if (!session || session.user.role !== 'school') {
    redirect('/school/login')
  }

  // Récupérer les données du dashboard
  const result = await getSchoolDashboard(session.user.schoolId!)

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600">{result.error || 'Une erreur est survenue'}</p>
        </div>
      </div>
    )
  }

  const { school, students, stats } = result.data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
              <p className="text-gray-600 mt-1">{school.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/school/orders"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Commandes
                {stats.pendingOrders > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    {stats.pendingOrders}
                  </span>
                )}
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Étudiants
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalStudents}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Classes
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.classesList.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Commandes
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>
            <p className="text-sm text-orange-600 mt-1">
              {stats.pendingOrders} en attente
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Revenu Total
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalRevenue.toFixed(2)} €
            </p>
          </div>
        </div>

        {/* Informations de l'école */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informations de l&apos;établissement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Adresse</p>
              <p className="text-gray-900">{school.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Téléphone</p>
              <p className="text-gray-900">{school.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Code de connexion</p>
              <p className="text-gray-900 font-mono">{school.loginCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{school.email}</p>
            </div>
          </div>
        </div>

        {/* Liste des étudiants */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Liste des étudiants
          </h2>

          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun étudiant enregistré pour le moment
            </p>
          ) : (
            <StudentsTable students={students} />
          )}
        </div>
      </main>
    </div>
  )
}
