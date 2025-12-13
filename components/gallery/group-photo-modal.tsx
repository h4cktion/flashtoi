"use client";

import { Photo, ITemplate, PhotoPlanche } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState, useEffect } from "react";
import Image from "next/image";

interface GroupPhotoModalProps {
  photo: Photo;
  template?: ITemplate;
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
}

export function GroupPhotoModal({
  photo,
  template,
  isOpen,
  onClose,
  studentId,
  studentName,
  student_id,
  classId,
}: GroupPhotoModalProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);

  // Use values from template if available, otherwise from photo
  const price = template ? template.price : photo.price;
  const format = template ? template.format : photo.format;
  const displayUrl = photo.cloudFrontUrl;

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
      format: photo.planche as PhotoPlanche,
      plancheName: photo.planche,
      unitPrice: price,
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
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {photo.planche.replace(/-/g, " ")}
          </h2>
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
          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-6">
            <Image
              src={displayUrl}
              alt="Photo de classe"
              fill
              className="object-contain" // Use contain to see whole photo
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>

          {/* Infos et bouton */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Format</p>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {format}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {price.toFixed(2)} €
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
