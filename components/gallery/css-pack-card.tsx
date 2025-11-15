"use client";

import { Pack, PhotoPlanche } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState } from "react";
import { CssPackModal } from "./css-pack-modal";

interface CssPackCardProps {
  pack: Pack;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
  thumbnailUrl: string;
}

export function CssPackCard({
  pack,
  studentId,
  studentName,
  student_id,
  classId,
  thumbnailUrl,
}: CssPackCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsAdding(true);

    // Ajouter chaque photo du pack au panier
    pack.photos.forEach((photo) => {
      const photoUrl = `/api/generate-planche?studentId=${studentId}&planche=${photo.planche}`;

      addToCart({
        photoUrl,
        format: photo.planche as PhotoPlanche,
        unitPrice: photo.price,
        studentId,
        studentName,
        student_id,
        classId,
      });
    });

    // Feedback visuel
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const handlePackClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white border-2 border-[#192F84]/20 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#192F84] transition-all cursor-pointer">
        {/* Header vide pour l'instant (comme demandé) */}
        <div className="h-32 bg-gradient-to-br from-[#192F84]/5 to-[#192F84]/10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#192F84] mb-1">
              {pack.pack.name}
            </div>
            <div className="text-sm text-gray-600">
              {pack.photos.length} photo{pack.photos.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4" onClick={handlePackClick}>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Pack {pack.pack.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {pack.pack.description}
          </p>

          {/* Prix */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-[#192F84]">
              {pack.pack.price.toFixed(2)} €
            </span>
            <span className="text-sm text-green-600">
              Pack économique
            </span>
          </div>

          {/* Bouton */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 text-white ${
              isAdding
                ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-md"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {isAdding ? "✓ Ajouté au panier" : "AJOUTER LE PACK"}
          </button>

          {/* Info CSS */}
          <p className="text-xs text-green-600 mt-2 text-center">
            ⚡ Rendu CSS instantané
          </p>
        </div>
      </div>

      {/* Modal détail pack */}
      <CssPackModal
        pack={pack}
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
