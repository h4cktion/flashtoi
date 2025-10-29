"use client";

import Image from "next/image";
import { Photo } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PhotoModal } from "@/components/gallery/photo-modal";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  studentId: string;
  studentName: string;
}

export function PhotoCard({ photo, index, studentId, studentName }: PhotoCardProps) {
  const router = useRouter();
  const params = useParams();
  const urlStudentId = params.id as string;
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart({
      photoUrl: photo.cloudFrontUrl,
      format: photo.format,
      unitPrice: photo.price,
      studentId,
      studentName,
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
      // Mobile: naviguer vers page détail
      router.push(`/gallery/${urlStudentId}/photo/${index}`);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex items-center gap-4 p-3">
        {/* Image miniature à gauche - Cliquable */}
        <div
          className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center"
          onClick={handlePhotoClick}
        >
          <Image
            src={photo.cloudFrontUrl}
            alt={`Photo ${index + 1}`}
            fill
            className="object-contain"
            sizes="96px"
          />
        </div>

        {/* Infos photo au centre - Cliquable */}
        <div className="flex-1 cursor-pointer" onClick={handlePhotoClick}>
          <p className="text-base font-semibold text-gray-900 mb-1">
            {photo.format}
          </p>
          <p className="text-xl font-bold text-gray-900">
            {photo.price.toFixed(2)} €
          </p>
        </div>

        {/* Bouton AJOUTER AU PANIER à droite */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-colors flex-shrink-0 text-white text-xs sm:text-base ${
            isAdding ? "bg-green-500" : "bg-[#192F84] hover:bg-[#1a3699]"
          }`}
        >
          <span className="hidden sm:inline">{isAdding ? "✓ Ajouté" : "AJOUTER AU PANIER"}</span>
          <span className="sm:hidden">{isAdding ? "✓" : "AJOUTER"}</span>
        </button>
      </div>

      {/* Modal photo pour desktop */}
      <PhotoModal
        photo={photo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentId={studentId}
        studentName={studentName}
      />
    </>
  );
}
