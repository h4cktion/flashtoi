'use client'

import { useStudentsStore } from '@/lib/stores/students-store'

export function StudentTabs() {
  const students = useStudentsStore((state) => state.students)
  const activeStudentIndex = useStudentsStore((state) => state.activeStudentIndex)
  const setActiveStudent = useStudentsStore((state) => state.setActiveStudent)
  const removeStudent = useStudentsStore((state) => state.removeStudent)

  if (students.length === 0) {
    return null
  }

  const handleRemoveStudent = (studentId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Voulez-vous vraiment retirer cet élève de la session ?')) {
      removeStudent(studentId)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Élèves sélectionnés
      </h3>

      <div className="flex flex-wrap gap-2">
        {students.map((student, index) => (
          <button
            key={student.id}
            onClick={() => setActiveStudent(index)}
            className={`relative group px-4 py-2 rounded-lg font-medium transition-all ${
              index === activeStudentIndex
                ? 'bg-[#192F84] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="pr-6">
              {student.firstName} {student.lastName}
            </span>

            {/* Bouton X pour retirer l'élève */}
            <span
              onClick={(e) => handleRemoveStudent(student.id, index, e)}
              className={`absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                index === activeStudentIndex
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
              }`}
              role="button"
              aria-label={`Retirer ${student.firstName} ${student.lastName}`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Classe: {students[activeStudentIndex]?.classId}
      </p>
    </div>
  )
}
