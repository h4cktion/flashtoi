"use client";

import { Photo, PhotoPlanche, ITemplate } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState } from "react";
import Image from "next/image";
import { GroupPhotoModal } from "./group-photo-modal";

interface GroupPhotoCardProps {
  photo: Photo;
  template?: ITemplate;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
}

export function GroupPhotoCard({
  photo,
  template,
  studentId,
  studentName,
  student_id,
  classId,
}: GroupPhotoCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use values from template if available, otherwise from photo
  const price = template ? template.price : photo.price;
  const format = template ? template.format : photo.format;
  const displayUrl = photo.cloudFrontUrl;

  const handlePhotoClick = () => {
     setIsModalOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsAdding(true);

    addToCart({
      photoUrl: photo.cloudFrontUrl,
      format: photo.planche as PhotoPlanche, // Keeping consistency with prev implementation
      plancheName: photo.planche,
      unitPrice: price,
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

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex items-center gap-4 p-3 mb-3">
        {/* Miniature de la photo à gauche */}
        <div 
          className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={handlePhotoClick}
        >
          <Image
            src={displayUrl}
            alt="Photo de classe"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>

        {/* Infos photo au centre */}
        <div className="flex-1 cursor-pointer" onClick={handlePhotoClick}>
          <p className="text-base font-semibold text-gray-900 mb-1 capitalize">
            {photo.planche.replace(/-/g, " ")}
          </p>
          <p className="text-sm text-gray-600 mb-1">Format: {format}</p>
          <p className="text-xl font-bold text-gray-900">
            {price.toFixed(2)} €
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

      <GroupPhotoModal
        photo={photo}
        template={template}
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
