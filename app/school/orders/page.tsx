import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getSchoolOrders } from '@/lib/actions/school'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { OrdersTable } from '@/components/school/orders-table'
import Link from 'next/link'

export default async function SchoolOrdersPage() {
  // Vérifier l'authentification
  const session = await auth()

  if (!session || session.user.role !== 'school') {
    redirect('/school/login')
  }

  // Récupérer les commandes
  const result = await getSchoolOrders(session.user.schoolId!)

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600">
            {result.error || 'Une erreur est survenue'}
          </p>
        </div>
      </div>
    )
  }

  const orders = result.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
              <p className="text-gray-600 mt-1">
                {session.user.name || 'École'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/school/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                ← Dashboard
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total commandes
            </h3>
            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              En attente
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Payées</h3>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter((o) => o.status === 'paid').length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Revenu total
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {orders
                .reduce((sum, order) => sum + order.totalAmount, 0)
                .toFixed(2)}{' '}
              €
            </p>
          </div>
        </div>

        {/* Tableau des commandes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Historique des commandes
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-4 text-gray-500">
                Aucune commande pour le moment
              </p>
            </div>
          ) : (
            <OrdersTable orders={orders} schoolId={session.user.schoolId!} />
          )}
        </div>
      </main>
    </div>
  )
}
