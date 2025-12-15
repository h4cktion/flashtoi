import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getSchoolDashboard } from '@/lib/actions/school'
import { SignOutButton } from '@/components/auth/sign-out-button'
import Link from 'next/link'

export default async function SchoolDashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== 'school') {
    redirect('/school/login')
  }

  const result = await getSchoolDashboard(session.user.schoolId!)
  const school = result.data?.school

  if (!school) {
    return <div>Erreur de chargement</div>
  }

  const showRibWarning = !school.rib;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {school.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/school/settings"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Paramètres
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {showRibWarning && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  Votre RIB n'est pas renseigné. Veuillez l'ajouter dans les <Link href="/school/settings" className="font-bold underline">paramètres</Link> pour recevoir vos versements.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Action 1: Valider les commandes */}
          <Link href="/school/orders" className="block group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 h-full flex flex-col items-center text-center border border-gray-100 hover:border-indigo-100">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Valider les commandes</h3>
              <p className="text-gray-500">Vérifier les encaissements par chèque ou espèces et valider les commandes.</p>
            </div>
          </Link>

          {/* Action 2: Gérer les élèves/coupons */}
          <Link href="/school/students" className="block group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 h-full flex flex-col items-center text-center border border-gray-100 hover:border-indigo-100">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gérer les élèves / coupons</h3>
              <p className="text-gray-500">Voir la liste des élèves, télécharger les coupons et suivre les inscrits.</p>
            </div>
          </Link>

          {/* Action 3: Statistiques */}
          <Link href="/school/stats" className="block group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 h-full flex flex-col items-center text-center border border-gray-100 hover:border-indigo-100">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Statistiques</h3>
              <p className="text-gray-500">Suivre le chiffre d'affaires, le panier moyen et les performances.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
