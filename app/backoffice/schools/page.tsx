import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getAllSchoolsForAdmin } from '@/lib/actions/admin'
import { SchoolsTable } from '@/components/backoffice/schools-table'
import Link from 'next/link'

export default async function BackofficeSchoolsPage() {
  // Vérifier l'authentification
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/backoffice/login')
  }

  // Récupérer les écoles
  const result = await getAllSchoolsForAdmin()

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              Erreur lors du chargement des écoles: {result.error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { schools } = result.data

  // Calculer les statistiques globales de la page
  const totalStudents = schools.reduce((sum, s) => sum + s.studentsCount, 0)
  const totalOrders = schools.reduce((sum, s) => sum + s.ordersCount, 0)
  const totalRevenue = schools.reduce((sum, s) => sum + s.totalRevenue, 0)
  const totalPending = schools.reduce((sum, s) => sum + s.pendingOrders, 0)
  const totalPaid = schools.reduce((sum, s) => sum + s.paidOrders, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des écoles</h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble de toutes les écoles</p>
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
            <div className="text-sm font-medium text-gray-600">Écoles</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {schools.length}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600">Étudiants</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {totalStudents}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-600">Commandes</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {totalOrders}
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-yellow-600">{totalPending} en attente</span>
              <span className="text-green-600">{totalPaid} payées</span>
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
            <div className="text-sm font-medium text-gray-600">
              Moyenne par école
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {schools.length > 0
                ? new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(totalRevenue / schools.length)
                : '0,00 €'}
            </div>
          </div>
        </div>

        {/* Schools table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SchoolsTable schools={schools} />
        </div>
      </main>
    </div>
  )
}
