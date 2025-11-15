"use client";

import { Pack, PhotoPlanche, ITemplate } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CssPlanchePreview } from "./css-planche-preview";
import { getTemplates } from "@/lib/actions/template";

interface CssPackModalProps {
  pack: Pack;
  thumbnailUrl: string;
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
}

export function CssPackModal({
  pack,
  thumbnailUrl,
  isOpen,
  onClose,
  studentId,
  studentName,
  student_id,
  classId,
}: CssPackModalProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les templates correspondant aux photos du pack
  useEffect(() => {
    if (!isOpen) return;

    const loadTemplates = async () => {
      setLoading(true);
      const result = await getTemplates();

      if (result.success && result.data) {
        // Filtrer seulement les templates qui correspondent aux planches du pack
        const packPlancheNames = pack.photos.map((p) => p.planche);
        const filteredTemplates = result.data.filter((t) =>
          packPlancheNames.includes(t.planche as PhotoPlanche)
        );
        setTemplates(filteredTemplates);
      }

      setLoading(false);
    };

    loadTemplates();
  }, [isOpen, pack.photos]);

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

  const handleAddPackToCart = () => {
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
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Pack {pack.pack.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {pack.pack.description}
            </p>
          </div>
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

        {/* Grille de photos */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#192F84] mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des photos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {pack.photos.map((photo, index) => {
                // Cas spécial : photo de classe (pas de template CSS)
                if (photo.planche === "classe") {
                  return (
                    <div
                      key={index}
                      className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={photo.cloudFrontUrl}
                        alt="Photo de classe"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                        Photo de classe
                      </div>
                    </div>
                  );
                }

                // Trouver le template correspondant pour les autres photos
                const template = templates.find(
                  (t) => t.planche === photo.planche
                );

                if (!template) {
                  return (
                    <div
                      key={index}
                      className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                    >
                      <p className="text-gray-500 text-sm">
                        Template non trouvé
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <CssPlanchePreview
                      template={template}
                      thumbnailUrl={thumbnailUrl}
                      showWatermark={true}
                      className="w-full h-full"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                      {photo.planche}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Prix et bouton */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {pack.photos.length} photo{pack.photos.length > 1 ? "s" : ""}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {pack.pack.price.toFixed(2)} €
              </p>
              <p className="text-sm text-green-600 mt-1">
                Économie par rapport à l&apos;achat séparé
              </p>
            </div>

            <button
              onClick={handleAddPackToCart}
              disabled={isAdding}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors text-white ${
                isAdding ? "bg-green-500" : "bg-[#192F84] hover:bg-[#1a3699]"
              }`}
            >
              {isAdding ? "✓ Ajouté" : "Ajouter le pack"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
