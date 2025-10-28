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
}

export function PhotoCard({ photo, index }: PhotoCardProps) {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
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
      router.push(`/gallery/${studentId}/photo/${index}`);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex items-center gap-4 p-3">
        {/* Image miniature à gauche - Cliquable */}
        <div
          className="relative w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={handlePhotoClick}
        >
          <Image
            src={photo.cloudFrontUrl}
            alt={`Photo ${index + 1}`}
            fill
            className="object-cover"
            sizes="80px"
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

        {/* Bouton AJOUTER AU PAINER à droite */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`px-6 py-3 rounded-full font-semibold transition-colors flex-shrink-0 text-white ${
            isAdding ? "bg-green-500" : "bg-[#192F84] hover:bg-[#1a3699]"
          }`}
        >
          {isAdding ? "✓ Ajouté" : "AJOUTER AU PAINER"}
        </button>
      </div>

      {/* Modal photo pour desktop */}
      <PhotoModal
        photo={photo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
