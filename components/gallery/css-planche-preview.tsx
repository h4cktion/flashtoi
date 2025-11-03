/**
 * Composant qui génère une planche en CSS pur
 * Place les photos de l'élève sur le background selon template.photos
 */

import Image from "next/image";
import { ITemplate } from "@/types";
import { CssWatermark } from "./css-watermark";

interface CssPlanchePreviewProps {
  template: ITemplate;
  thumbnailUrl: string;
  showWatermark?: boolean;
  className?: string;
}

export function CssPlanchePreview({
  template,
  thumbnailUrl,
  showWatermark = true,
  className = "",
}: CssPlanchePreviewProps) {
  // Déterminer si on utilise la version web ou normale
  const useWebVersion = !!template.photoWeb;

  // Choisir le background approprié
  let backgroundUrl = template.backgroundS3Url;
  if (useWebVersion && template.photoWeb) {
    // Construire l'URL du background web
    // Extraire le domaine CloudFront de backgroundS3Url
    const cloudFrontDomain =
      template.backgroundS3Url?.match(/https?:\/\/([^\/]+)/)?.[0];
    if (cloudFrontDomain) {
      backgroundUrl = `${cloudFrontDomain}/assets/backgrounds/${template.photoWeb.planche}.jpg`;
    }
  }

  // Choisir les photos appropriées
  const photosToRender =
    useWebVersion && template.photoWeb
      ? template.photoWeb.photos
      : template.photos;

  if (!backgroundUrl) {
    return (
      <div
        className={`relative bg-gray-200 flex items-center justify-center ${className}`}
      >
        <p className="text-gray-500">Background manquant</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background de la planche */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
        }}
      />

      {/* Toutes les photos de l'élève */}
      {photosToRender.map((photo, index) => {
        // Calculer la hauteur selon le ratio portrait (1:1.33)
        const heightPercent = photo.width * 1.33;

        return (
          <div
            key={index}
            className="absolute overflow-hidden"
            style={{
              left: `${photo.x}%`,
              top: `${photo.y}%`,
              width: `${photo.width}%`,
              height: `${heightPercent}%`,
              transform: `rotate(${photo.rotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            <div
              className="relative w-full h-full"
              style={{
                // Appliquer le crop top et bottom
                clipPath:
                  photo.cropTop > 0 || photo.cropBottom > 0
                    ? `inset(${photo.cropTop}% 0% ${photo.cropBottom}% 0%)`
                    : undefined,
              }}
            >
              <Image
                src={thumbnailUrl}
                alt="Photo élève"
                fill
                className="object-cover"
                sizes={`${photo.width}vw`}
                style={{
                  filter: photo.effect === "NB" ? "grayscale(100%)" : "none",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Watermark diagonal */}
      {showWatermark && <CssWatermark />}
    </div>
  );
}
