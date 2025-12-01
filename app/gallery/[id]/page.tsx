"use client";

import { useParams } from "next/navigation";
import { CartSummary } from "@/components/cart/cart-summary";
import { MobileCartButton } from "@/components/cart/mobile-cart-button";
import { PacksSection } from "@/components/cart/packs-section";
import { AddStudentForm } from "@/components/gallery/add-student-form";
import { StudentTabs } from "@/components/gallery/student-tabs";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useGalleryData } from "./hooks/use-gallery-data";
import { StudentHeader } from "@/components/gallery/student-header";
import { IndividualPhotosSection } from "@/components/gallery/individual-photos-section";

export default function Gallery3Page() {
  const params = useParams();
  const id = params.id as string;

  const { currentStudent, templates, packs, loading, error, mounted } =
    useGalleryData(id);

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
        <StudentHeader student={currentStudent} />

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#192F84] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des photos...</p>
          </div>
        ) : (
          <>
            {/* Section des packs */}
            <PacksSection
              packs={packs}
              studentId={currentStudent._id.toString()}
              studentName={`${currentStudent.firstName} ${currentStudent.lastName}`}
              student_id={currentStudent.student_id || ""}
              classId={currentStudent.classId}
              useCssRendering={true}
              thumbnailUrl={currentStudent.thumbnail?.cloudFrontUrl || ""}
            />

            {/* Galerie de planches CSS */}
            <IndividualPhotosSection
              templates={templates}
              student={currentStudent}
            />
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
