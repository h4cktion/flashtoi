"use client";

import { ITemplate, PhotoPlanche } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CssPlanchePreview } from "./css-planche-preview";
import { CssPhotoModal } from "./css-photo-modal";

interface CssPhotoCardProps {
  template: ITemplate;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
  thumbnailUrl: string;
}

export function CssPhotoCard({
  template,
  studentId,
  studentName,
  student_id,
  classId,
  thumbnailUrl,
}: CssPhotoCardProps) {
  const router = useRouter();
  const params = useParams();
  const urlStudentId = params.id as string;
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsAdding(true);

    // URL de l'API Sharp qui génère la planche finale pour la commande
    // (l'aperçu CSS n'est que pour l'affichage, la commande utilise Sharp)
    const photoUrl = `/api/generate-planche?studentId=${studentId}&planche=${template.planche}`;

    addToCart({
      photoUrl,
      format: template.planche as PhotoPlanche,
      plancheName: template.planche as PhotoPlanche,
      unitPrice: template.price,
      studentId,
      studentName,
      student_id,
      classId,
    });

    // Feedback visuel
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const handlePhotoClick = () => {
    // Détecter si desktop ou mobile
    const isDesktop = window.innerWidth >= 768;

    if (isDesktop) {
      // Desktop: ouvrir modal
      setIsModalOpen(true);
    } else {
      // Mobile: pour l'instant, ouvrir la modal aussi
      // TODO: créer une page dédiée si nécessaire
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex items-center gap-4 p-3">
        {/* Miniature de la planche à gauche */}
        <div
          className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={handlePhotoClick}
        >
          <CssPlanchePreview
            template={template}
            thumbnailUrl={thumbnailUrl}
            showWatermark={true}
            className="w-full h-full"
          />
        </div>

        {/* Infos photo au centre - Cliquable */}
        <div className="flex-1 cursor-pointer" onClick={handlePhotoClick}>
          <p className="text-base font-semibold text-gray-900 mb-1">
            {template.planche}
          </p>
          <p className="text-sm text-gray-600 mb-1">Format: {template.format}</p>
          <p className="text-xl font-bold text-gray-900">
            {template.price.toFixed(2)} €
          </p>
          <p className="text-xs text-green-600 mt-1">
            ⚡ Rendu CSS instantané
          </p>
        </div>

        {/* Bouton AJOUTER AU PANIER à droite */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 text-white text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            isAdding
              ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-md"
              : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg"
          }`}
        >
          <span className="hidden sm:inline">
            {isAdding ? "✓ Ajouté" : "AJOUTER"}
          </span>
          <span className="sm:hidden">{isAdding ? "✓" : "AJOUTER"}</span>
        </button>
      </div>

      {/* Modal photo pour desktop/mobile */}
      <CssPhotoModal
        template={template}
        thumbnailUrl={thumbnailUrl}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentId={studentId}
        studentName={studentName}
        student_id={student_id}
        classId={classId}
      />
    </>
  );
}
