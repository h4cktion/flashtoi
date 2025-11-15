"use client";

import Image from "next/image";
import { ITemplate, PhotoPlanche } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState } from "react";
import { useParams } from "next/navigation";

interface DynamicPhotoCardProps {
  template: ITemplate;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
}

export function DynamicPhotoCard({
  template,
  studentId,
  studentName,
  student_id,
  classId,
}: DynamicPhotoCardProps) {
  const params = useParams();
  const addToCart = useCartStore((state) => state.addToCart);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL directe vers l'API qui retourne l'image
  const plancheUrl = `/api/generate-planche?studentId=${studentId}&planche=${template.planche}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsAdding(true);
    addToCart({
      photoUrl: plancheUrl,
      format: template.planche as PhotoPlanche, // Cast car MongoDB retourne string
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
    // Ouvrir la planche en grand dans un nouvel onglet
    window.open(plancheUrl, "_blank");
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setError(null);
  };

  const handleImageError = () => {
    setError("Erreur de chargement");
    setIsImageLoaded(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex items-center gap-4 p-3">
      {/* Image miniature à gauche */}
      <div
        className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center"
        onClick={handlePhotoClick}
      >
        {!isImageLoaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-xs text-gray-500">Génération...</p>
          </div>
        )}

        {error ? (
          <div className="text-center p-2">
            <p className="text-xs text-red-600">Erreur</p>
          </div>
        ) : (
          <Image
            src={plancheUrl}
            alt={template.planche}
            fill
            className="object-contain"
            sizes="96px"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>

      {/* Infos photo au centre */}
      <div className="flex-1">
        <p className="text-base font-semibold text-gray-900 mb-1">
          {template.planche}
        </p>
        <p className="text-sm text-gray-600 mb-1">Format: {template.format}</p>
        <p className="text-xl font-bold text-gray-900">
          {template.price.toFixed(2)} €
        </p>
        {!isImageLoaded && !error && (
          <p className="text-xs text-blue-600 mt-1">
            ⚡ Génération en cours...
          </p>
        )}
      </div>

      {/* Bouton AJOUTER AU PANIER à droite */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || !isImageLoaded || error !== null}
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
  );
}
