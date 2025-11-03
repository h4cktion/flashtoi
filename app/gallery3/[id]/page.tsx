"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getStudentById } from "@/lib/actions/student";
import { getTemplates } from "@/lib/actions/template";
import { IStudent, ITemplate } from "@/types";
import { CssPhotoCard } from "@/components/gallery/css-photo-card";
import { CartSummary } from "@/components/cart/cart-summary";
import { MobileCartButton } from "@/components/cart/mobile-cart-button";
import { AddStudentForm } from "@/components/gallery/add-student-form";
import { StudentTabs } from "@/components/gallery/student-tabs";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useStudentsStore } from "@/lib/stores/students-store";

export default function Gallery3Page() {
  const params = useParams();
  const id = params.id as string;

  const [mounted, setMounted] = useState(false);
  const students = useStudentsStore((state) => state.students);
  const activeStudentIndex = useStudentsStore(
    (state) => state.activeStudentIndex
  );
  const addStudent = useStudentsStore((state) => state.addStudent);

  const [currentStudent, setCurrentStudent] = useState<IStudent | null>(null);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const [studentResult, templatesResult] = await Promise.all([
          getStudentById(id),
          getTemplates(),
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
      } catch (err) {
        console.error("Error loading student:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadInitialStudent();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
        const studentResult = await getStudentById(activeStudent.id);

        if (!studentResult.success || !studentResult.data) {
          setError(studentResult.error || "Élève non trouvé");
          return;
        }

        setCurrentStudent(studentResult.data);
      } catch (err) {
        console.error("Error loading active student:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadActiveStudent();
  }, [activeStudentIndex, students, currentStudent]);

  if (loading && !currentStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#192F84] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !currentStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentStudent) {
    return null;
  }

  // Ne pas afficher les composants Zustand avant le montage pour éviter les erreurs d'hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#192F84] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton de déconnexion en haut */}
        <div className="flex justify-start mb-4">
          <SignOutButton variant="compact" />
        </div>

        {/* Formulaire d'ajout d'élève */}
        <AddStudentForm />

        {/* Tabs des élèves */}
        <StudentTabs />

        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-6">
            {/* Miniature de l'élève */}
            {currentStudent.thumbnail?.cloudFrontUrl && (
              <div className="relative w-24 h-32 flex-shrink-0">
                <Image
                  src={currentStudent.thumbnail.cloudFrontUrl}
                  alt={`${currentStudent.firstName} ${currentStudent.lastName}`}
                  fill
                  className="object-cover rounded-lg shadow-md"
                  sizes="96px"
                />
              </div>
            )}

            {/* Informations de l'élève */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentStudent.firstName} {currentStudent.lastName}
              </h1>
              <p className="text-gray-600 mt-2">
                Classe: {currentStudent.classId}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#192F84] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des photos...</p>
          </div>
        ) : (
          <>
            {/* Galerie de planches CSS */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-xl font-semibold mb-4">
                Photos disponibles ({templates.length})
              </h2>

              {templates.length > 0 &&
              currentStudent.thumbnail?.cloudFrontUrl ? (
                <div className="flex flex-col gap-3">
                  {templates.map((template) => (
                    <CssPhotoCard
                      key={template._id.toString()}
                      template={template}
                      studentId={currentStudent._id.toString()}
                      studentName={`${currentStudent.firstName} ${currentStudent.lastName}`}
                      student_id={currentStudent.student_id || ""}
                      classId={currentStudent.classId}
                      thumbnailUrl={
                        currentStudent.thumbnail?.cloudFrontUrl || ""
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">
                  Aucun template disponible pour le moment
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Résumé du panier (flottant sur desktop uniquement) */}
      <CartSummary />

      {/* Bouton panier mobile (fixe en haut à droite) */}
      <MobileCartButton />
    </div>
  );
}
