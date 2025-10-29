import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IStudent } from "@/types";

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  login: string;
  classId: string;
}

interface StudentsStore {
  students: StudentInfo[];
  activeStudentIndex: number;
  addStudent: (student: IStudent) => boolean;
  removeStudent: (studentId: string) => void;
  setActiveStudent: (index: number) => void;
  getActiveStudent: () => StudentInfo | null;
  clearStudents: () => void;
}

export const useStudentsStore = create<StudentsStore>()(
  persist(
    (set, get) => ({
      students: [],
      activeStudentIndex: 0,

      addStudent: (student) => {
        const { students } = get();

        // Vérifier si l'élève est déjà ajouté
        if (students.some((s) => s.id === student._id.toString())) {
          return false;
        }

        const newStudent: StudentInfo = {
          id: student._id.toString(),
          firstName: student.firstName,
          lastName: student.lastName,
          login: student.loginCode,
          classId: student.classId,
        };

        set((state) => ({
          students: [...state.students, newStudent],
          activeStudentIndex: state.students.length, // Activer le nouvel élève
        }));

        return true;
      },

      removeStudent: (studentId) => {
        set((state) => {
          const newStudents = state.students.filter((s) => s.id !== studentId);
          let newActiveIndex = state.activeStudentIndex;

          // Ajuster l'index actif si nécessaire
          if (newActiveIndex >= newStudents.length && newStudents.length > 0) {
            newActiveIndex = newStudents.length - 1;
          } else if (newStudents.length === 0) {
            newActiveIndex = 0;
          }

          return {
            students: newStudents,
            activeStudentIndex: newActiveIndex,
          };
        });
      },

      setActiveStudent: (index) => {
        const { students } = get();
        if (index >= 0 && index < students.length) {
          set({ activeStudentIndex: index });
        }
      },

      getActiveStudent: () => {
        const { students, activeStudentIndex } = get();
        return students[activeStudentIndex] || null;
      },

      clearStudents: () => {
        set({
          students: [],
          activeStudentIndex: 0,
        });
      },
    }),
    {
      name: "students-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
