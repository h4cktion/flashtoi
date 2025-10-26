import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getSchoolDashboard } from '@/lib/actions/school'
import { SignOutButton } from '@/components/auth/sign-out-button'

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

  // Grouper les étudiants par classe
  const studentsByClass = students.reduce((acc, student) => {
    if (!acc[student.classId]) {
      acc[student.classId] = []
    }
    acc[student.classId].push(student)
    return acc
  }, {} as Record<string, typeof students>)

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
            <SignOutButton />
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
            Informations de l'établissement
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

        {/* Liste des étudiants par classe */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Étudiants par classe
          </h2>

          {stats.classesList.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun étudiant enregistré pour le moment
            </p>
          ) : (
            <div className="space-y-6">
              {stats.classesList.map((classId) => (
                <div key={classId} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Classe: {classId}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({studentsByClass[classId].length} étudiant{studentsByClass[classId].length > 1 ? 's' : ''})
                    </span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Nom
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Prénom
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Code Login
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            QR Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Photos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentsByClass[classId].map((student) => (
                          <tr key={student._id.toString()} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {student.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {student.firstName}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-600">
                              {student.loginCode}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-600">
                              {student.qrCode}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.photos?.length || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
