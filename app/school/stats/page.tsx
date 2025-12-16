import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getSchoolDashboard } from '@/lib/actions/school'
import { SignOutButton } from '@/components/auth/sign-out-button'
import Link from 'next/link'

export default async function SchoolStatsPage() {
  const session = await auth()

  if (!session || session.user.role !== 'school') {
    redirect('/school/login')
  }

  const result = await getSchoolDashboard(session.user.schoolId!)

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <p className="text-red-500">Erreur de chargement</p>
        </div>
      </div>
    )
  }

  const { stats } = result.data

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
           <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
                <p className="text-gray-600 mt-1">
                  Vue d&apos;ensemble des ventes
                </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/school/dashboard"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Retour</span>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Chiffre d&apos;affaire (30%)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{(stats.totalRevenue * 0.3).toFixed(2)} €</p>
            <p className="text-sm text-gray-500 mt-1">sur {stats.totalRevenue.toFixed(2)} € total</p>
          </div>
          
           <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Commandes Totales</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalOrders}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Élèves</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalStudents}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Panier Moyen</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.totalOrders > 0 
                ? (stats.totalRevenue / stats.totalOrders).toFixed(2) 
                : '0.00'
              } €
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
