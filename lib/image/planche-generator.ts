/**
 * Générateur de planches dynamique utilisant Sharp
 */

import sharp from 'sharp';
import { ITemplate } from '@/types';
import { S3Uploader } from '@/lib/utils/s3-uploader';

export interface GeneratePlancheParams {
  thumbnailUrl: string;
  template: ITemplate;
  studentData: {
    firstName: string;
    lastName: string;
    qrCode?: string;
  };
  addWatermark: boolean;
}

export class PlancheGenerator {
  private s3Uploader: S3Uploader;

  constructor() {
    this.s3Uploader = new S3Uploader();
  }

  /**
   * Génère une planche complète
   */
  async generatePlanche(params: GeneratePlancheParams): Promise<Buffer> {
    const { thumbnailUrl, template, addWatermark } = params;

    try {
      console.log('[PlancheGenerator] Starting generation...');

      // 1. Télécharger et charger le background
      console.log('[PlancheGenerator] Downloading background:', template.backgroundS3Url);
      const backgroundBuffer = await this.downloadImage(template.backgroundS3Url!);
      console.log('[PlancheGenerator] Background downloaded, size:', backgroundBuffer.length);

      const background = sharp(backgroundBuffer);

      // Obtenir les dimensions du background
      const backgroundMetadata = await background.metadata();
      const bgWidth = backgroundMetadata.width || 1000;
      const bgHeight = backgroundMetadata.height || 1000;
      console.log('[PlancheGenerator] Background dimensions:', bgWidth, 'x', bgHeight);

      // 2. Télécharger la thumbnail de l'étudiant
      console.log('[PlancheGenerator] Downloading thumbnail:', thumbnailUrl);
      const thumbnailBuffer = await this.downloadImage(thumbnailUrl);
      console.log('[PlancheGenerator] Thumbnail downloaded, size:', thumbnailBuffer.length);

      // 3. Préparer toutes les compositions (une pour chaque photo dans le template)
      console.log('[PlancheGenerator] Processing', template.photos.length, 'photos');
      const compositeArray: sharp.OverlayOptions[] = [];

      for (let i = 0; i < template.photos.length; i++) {
        const photo = template.photos[i];
        console.log(`[PlancheGenerator] Processing photo ${i + 1}/${template.photos.length}`, photo);

        // Convertir les pourcentages en pixels
        const photoX = Math.round((photo.x / 100) * bgWidth);
        const photoY = Math.round((photo.y / 100) * bgHeight);
        const photoWidth = Math.round((photo.width / 100) * bgWidth);

        // Traiter la photo de l'élève
        let processedPhoto = sharp(thumbnailBuffer);

        // Appliquer le crop
        if (photo.cropTop > 0 || photo.cropBottom > 0) {
          const thumbnailMeta = await sharp(thumbnailBuffer).metadata();
          const thumbWidth = thumbnailMeta.width || 300;
          const thumbHeight = thumbnailMeta.height || 400;

          const cropTopPx = Math.round((photo.cropTop / 100) * thumbHeight);
          const cropBottomPx = Math.round((photo.cropBottom / 100) * thumbHeight);
          const croppedHeight = thumbHeight - cropTopPx - cropBottomPx;

          processedPhoto = processedPhoto.extract({
            left: 0,
            top: cropTopPx,
            width: thumbWidth,
            height: croppedHeight,
          });
        }

        // Calculer la hauteur selon le ratio portrait (1:1.33)
        const photoHeight = Math.round(photoWidth * 1.33);

        // Redimensionner
        processedPhoto = processedPhoto.resize(photoWidth, photoHeight, {
          fit: 'cover',
          position: 'center',
        });

        // Appliquer l'effet NB si nécessaire
        if (photo.effect === 'NB') {
          processedPhoto = processedPhoto.grayscale();
        }

        // Appliquer la rotation si nécessaire
        if (photo.rotation !== 0) {
          processedPhoto = processedPhoto.rotate(photo.rotation, {
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          });
        }

        const processedBuffer = await processedPhoto.toBuffer();

        compositeArray.push({
          input: processedBuffer,
          top: photoY,
          left: photoX,
        });
      }

      // 4. Composer l'image (background + toutes les photos)
      const composedImage = await background.composite(compositeArray).toBuffer();

      // 5. Ajouter le watermark si nécessaire
      if (addWatermark) {
        return this.addWatermark(composedImage, bgWidth, bgHeight);
      }

      return composedImage;
    } catch (error) {
      console.error('Error generating planche:', error);
      throw error;
    }
  }

  /**
   * Ajoute un watermark diagonal répété sur l'image
   */
  private async addWatermark(
    imageBuffer: Buffer,
    width: number,
    height: number
  ): Promise<Buffer> {
    try {
      // Créer un SVG avec le texte watermark répété en diagonale
      const watermarkText = '© PHOTO SCOLAIRE';
      const fontSize = 40;
      const spacing = 150;

      // Créer le pattern de watermark
      const svgWatermark = `
        <svg width="${width}" height="${height}">
          <defs>
            <pattern id="watermark" x="0" y="0" width="${spacing * 2}" height="${spacing * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
              <text x="${spacing}" y="${spacing}" font-size="${fontSize}" fill="rgba(255,255,255,0.3)" font-family="Arial" font-weight="bold" text-anchor="middle">
                ${watermarkText}
              </text>
            </pattern>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#watermark)" />
        </svg>
      `;

      // Appliquer le watermark sur l'image
      const result = await sharp(imageBuffer)
        .composite([
          {
            input: Buffer.from(svgWatermark),
            top: 0,
            left: 0,
          },
        ])
        .toBuffer();

      return result;
    } catch (error) {
      console.error('Error adding watermark:', error);
      return imageBuffer; // Retourner l'image sans watermark en cas d'erreur
    }
  }

  /**
   * Télécharge une image depuis une URL
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image from ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Upload une planche générée vers S3
   */
  async uploadToS3(
    buffer: Buffer,
    s3Key: string
  ): Promise<{ success: boolean; url: string; s3Key: string; error?: string }> {
    return this.s3Uploader.uploadBuffer(buffer, s3Key, 'image/jpeg');
  }

  /**
   * Vérifie si une planche existe déjà sur S3
   */
  async plancheExists(s3Key: string): Promise<boolean> {
    return this.s3Uploader.fileExists(s3Key);
  }

  /**
   * Obtient l'URL CloudFront d'une planche
   */
  getPlancheUrl(s3Key: string): string {
    return this.s3Uploader.getCloudFrontUrl(s3Key);
  }
}
