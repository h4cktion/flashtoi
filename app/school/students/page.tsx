import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getSchoolDashboard } from '@/lib/actions/school'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { StudentsTable } from '@/components/school/students-table'
import Link from 'next/link'


export default async function SchoolStudentsPage() {
  // Vérifier l'authentification
  const session = await auth()

  if (!session || session.user.role !== 'school') {
    redirect('/school/login')
  }

  // Récupérer les données du dashboard (qui contient les élèves)
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
                href="/school/dashboard"
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
                Tableau de bord (Commandes)
              </Link>
              <Link
                href="/school/settings"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Paramètres
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistiques rapides (Optionnel, garder ou non ?) - Je garde pour l'instant */}
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
