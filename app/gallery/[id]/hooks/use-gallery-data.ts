import { useState, useEffect } from "react";
import { getStudentById } from "@/lib/actions/student";
import { getAvailablePacksForStudentCss } from "@/lib/actions/pack";
import { getTemplates } from "@/lib/actions/template";
import { IStudent, ITemplate, Pack } from "@/types";
import { useStudentsStore } from "@/lib/stores/students-store";

export function useGalleryData(initialStudentId: string) {
  const students = useStudentsStore((state) => state.students);
  const activeStudentIndex = useStudentsStore(
    (state) => state.activeStudentIndex
  );
  const addStudent = useStudentsStore((state) => state.addStudent);

  const [currentStudent, setCurrentStudent] = useState<IStudent | null>(null);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs d'hydration avec Zustand
  useEffect(() => {
    setMounted(true);
  }, []);

  // Charger l'élève initial (depuis l'URL) au premier montage
  useEffect(() => {
    const loadInitialStudent = async () => {
      setLoading(true);
      setError(null);

      try {
        const [studentResult, templatesResult, packsResult] = await Promise.all([
          getStudentById(initialStudentId),
          getTemplates(),
          getAvailablePacksForStudentCss(initialStudentId),
        ]);

        if (!studentResult.success || !studentResult.data) {
          setError(studentResult.error || "Élève non trouvé");
          return;
        }

        // Ajouter l'élève au store s'il n'est pas déjà ajouté
        if (students.length === 0) {
          addStudent(studentResult.data);
        }

        setCurrentStudent(studentResult.data);

        // Charger les templates
        setTemplates(
          templatesResult.success && templatesResult.data
            ? templatesResult.data
            : []
        );

        // Charger les packs
        setPacks(
          packsResult.success && packsResult.data ? packsResult.data : []
        );
      } catch (err) {
        console.error("Error loading student:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadInitialStudent();
  }, [initialStudentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Charger l'élève actif quand il change
  useEffect(() => {
    const loadActiveStudent = async () => {
      if (students.length === 0) return;

      const activeStudent = students[activeStudentIndex];
      if (!activeStudent) return;

      // Ne pas recharger si c'est déjà l'élève actuel
      if (
        currentStudent &&
        currentStudent._id.toString() === activeStudent.id
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [studentResult, packsResult] = await Promise.all([
          getStudentById(activeStudent.id),
          getAvailablePacksForStudentCss(activeStudent.id),
        ]);

        if (!studentResult.success || !studentResult.data) {
          setError(studentResult.error || "Élève non trouvé");
          return;
        }

        setCurrentStudent(studentResult.data);
        setPacks(
          packsResult.success && packsResult.data ? packsResult.data : []
        );
      } catch (err) {
        console.error("Error loading active student:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadActiveStudent();
  }, [activeStudentIndex, students, currentStudent]);

  return {
    currentStudent,
    templates,
    packs,
    loading,
    error,
    mounted,
  };
}
