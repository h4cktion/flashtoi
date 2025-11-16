"use client";

import { Photo } from "@/types";
import Image from "next/image";

interface ClassPhotoSelectorProps {
  classPhotos: Photo[];
  selectedPhotoId: string | null;
  onSelect: (photoId: string) => void;
}

export function ClassPhotoSelector({
  classPhotos,
  selectedPhotoId,
  onSelect,
}: ClassPhotoSelectorProps) {
  // Ne pas afficher le sélecteur s'il n'y a qu'une seule photo
  if (classPhotos.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">
        Choisissez votre photo de classe
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Sélectionnez la photo de classe que vous souhaitez inclure dans ce pack
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {classPhotos.map((photo, index) => {
          const photoId = photo.s3Key;
          const isSelected = photoId === selectedPhotoId;

          return (
            <button
              key={photoId}
              type="button"
              onClick={() => onSelect(photoId)}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-300 shadow-lg"
                  : "border-gray-300 hover:border-gray-400 hover:shadow-md"
              }`}
            >
              <Image
                src={photo.cloudFrontUrl}
                alt={`Photo de classe ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg">
                    ✓
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs text-center font-medium">
                Photo {index + 1}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
