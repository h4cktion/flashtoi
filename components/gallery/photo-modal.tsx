"use client";

import Image from "next/image";
import { Photo } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState, useEffect } from "react";

interface PhotoModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
}

export function PhotoModal({
  photo,
  isOpen,
  onClose,
  studentId,
  studentName,
  student_id,
  classId,
}: PhotoModalProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      photoUrl: photo.cloudFrontUrl,
      format: photo.planche,
      plancheName: photo.planche,
      unitPrice: photo.price,
      studentId,
      studentName,
      student_id,
      classId,
    });
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">{photo.planche}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Photo */}
        <div className="p-6">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-6">
            <Image
              src={photo.cloudFrontUrl}
              alt={`Photo ${photo.planche}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          {/* Infos et bouton */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Planche</p>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {photo.planche}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {photo.price.toFixed(2)} €
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors text-white ${
                isAdding ? "bg-green-500" : "bg-[#192F84] hover:bg-[#1a3699]"
              }`}
            >
              {isAdding ? "✓ Ajouté" : "Ajouter au panier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
