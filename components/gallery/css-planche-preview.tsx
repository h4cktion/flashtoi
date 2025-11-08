/**
 * Composant qui génère une planche en CSS pur
 * Place les photos de l'élève sur le background selon template.photos
 */

import React from "react";
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [bgDimensions, setBgDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [containerDimensions, setContainerDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

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

  // Observer les dimensions du container
  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!backgroundUrl) {
    return (
      <div
        className={`relative bg-gray-200 flex items-center justify-center ${className}`}
      >
        <p className="text-gray-500">Background manquant</p>
      </div>
    );
  }

  // Calculer les dimensions exactes du background visible (object-contain)
  let wrapperStyle: React.CSSProperties = {};
  if (bgDimensions && containerDimensions) {
    const bgRatio = bgDimensions.width / bgDimensions.height;
    const containerRatio = containerDimensions.width / containerDimensions.height;

    if (bgRatio > containerRatio) {
      // Background plus large que le container → prend toute la largeur
      wrapperStyle = {
        width: "100%",
        height: `${(containerDimensions.width / bgRatio)}px`,
      };
    } else {
      // Background plus haut que le container → prend toute la hauteur
      wrapperStyle = {
        width: `${(containerDimensions.height * bgRatio)}px`,
        height: "100%",
      };
    }
  }

  return (
    <div ref={containerRef} className={`relative bg-gray-100 ${className}`}>
      {/* Background de la planche */}
      <Image
        src={backgroundUrl}
        alt="Background"
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, 600px"
        priority
        onLoadingComplete={(img) => {
          setBgDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }}
      />

      {/* Wrapper qui a exactement la taille et position du background visible */}
      {bgDimensions && containerDimensions && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={wrapperStyle}
        >
          <div className="relative w-full h-full">
        {/* Toutes les photos de l'élève */}
        {photosToRender.map((photo, index) => {
        // Calculer la hauteur selon le ratio portrait (1:1.33)
        // IMPORTANT: Ajuster pour tenir compte des crops
        // Le container doit être plus grand car clipPath va retirer des portions
        const desiredHeight = photo.width * 1.33;
        const cropFactor = 1 - (photo.cropTop / 100) - (photo.cropBottom / 100);
        const heightPercent = desiredHeight / cropFactor;

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
        </div>
      )}
    </div>
  );
}
