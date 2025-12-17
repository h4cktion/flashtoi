import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getSchoolDashboard } from '@/lib/actions/school'
import Image from 'next/image'
import { PrintButton } from '@/components/ui/print-button'


export default async function TrombinoscopePage() {
  const session = await auth()

  if (!session || session.user.role !== 'school') {
    redirect('/school/login')
  }

  const result = await getSchoolDashboard(session.user.schoolId!)

  if (!result.success || !result.data) {
    return <div>Erreur lors du chargement des données</div>
  }

  const { students, school } = result.data

  // Grouper les étudiants par classe
  const studentsByClass = students.reduce((acc, student) => {
    const className = student.classId || 'Sans classe'
    if (!acc[className]) {
      acc[className] = []
    }
    acc[className].push(student)
    return acc
  }, {} as Record<string, typeof students>)

  return (
    <div className="bg-white min-h-screen">
      <style>{`
        @page {
          size: A4 landscape;
          margin: 0.5cm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none;
          }
          .page-break-after-always {
            break-after: page;
            page-break-after: always;
          }
        }
      `}</style>

      <PrintButton />

      {Object.entries(studentsByClass).flatMap(([className, classStudents]) => {
        // Nombre d'élèves par page (8 colonnes x 5 lignes = 40)
        const STUDENTS_PER_PAGE = 40;
        const chunks = [];
        for (let i = 0; i < classStudents.length; i += STUDENTS_PER_PAGE) {
          chunks.push(classStudents.slice(i, i + STUDENTS_PER_PAGE));
        }

        return chunks.map((chunk, pageIndex) => (
          <div key={`${className}-${pageIndex}`} className="mb-0 page-break-after-always w-full flex flex-col pl-4 pr-4 pt-2">
            {/* Début En-tête simplifié - Compact */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-1 mb-2">
              <h1 className="text-lg font-bold text-gray-900">{className}</h1>
               {chunks.length > 1 && (
                 <span className="text-xs text-gray-500">P. {pageIndex + 1}/{chunks.length}</span>
               )}
            </div>
             {/* Fin En-tête simplifié */}

            {/* Grille de photos densifiée */}
            <div className="grid grid-cols-8 gap-x-2 gap-y-1 content-start">
              {chunk.map((student) => (
                <div key={student._id.toString()} className="flex flex-col items-center">
                  <div className="aspect-[3/4] w-16 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-0.5">
                    {student.photos && 
                     student.photos.length > 0 && 
                     student.photos[0].cloudFrontUrl ? (
                      <Image
                        src={student.photos[0].cloudFrontUrl}
                        alt={`${student.firstName} ${student.lastName}`}
                        fill
                        className="object-cover"
                        sizes="70px"
                      />
                    ) : student.thumbnail && student.thumbnail.cloudFrontUrl ? (
                      <Image
                         src={student.thumbnail.cloudFrontUrl}
                         alt={`${student.firstName} ${student.lastName}`}
                         fill
                         className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-center w-16">
                    <p className="font-bold text-gray-900 text-[9px] truncate w-full leading-tight">{student.firstName}</p>
                    <p className="text-gray-600 text-[8px] truncate w-full leading-tight mb-0.5">{student.lastName.toUpperCase()}</p>
                    
                    {/* Indicateur de statut compact */}
                    <div className="flex justify-center">
                      {student.ordersCount && student.ordersCount > 0 ? (
                        <span className="inline-block px-1 py-px bg-green-100 text-green-800 text-[6px] font-bold rounded-full border border-green-200 leading-none">
                          {student.ordersCount} cmd
                        </span>
                      ) : student.hasLoggedIn ? (
                        <span className="inline-block px-1 py-px bg-orange-100 text-orange-800 text-[6px] font-bold rounded-full border border-orange-200 leading-none">
                          Connecté
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1 py-px bg-red-100 text-red-800 text-[6px] font-bold rounded-full border border-red-200 leading-none gap-0.5">
                          <span className="text-[6px]">x</span>
                          Non connecté
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            

          </div>
        ));
      })}
    </div>
  )
}
