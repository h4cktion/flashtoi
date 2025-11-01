/**
 * Utilitaire pour upload de fichiers vers AWS S3
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFile } from 'fs/promises';

export class S3Uploader {
  private s3Client: S3Client;
  private bucketName: string;
  private cloudFrontDomain: string;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'eu-west-1';
    this.bucketName = process.env.S3_BUCKET_NAME || '';
    this.cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN || '';

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error(
        'AWS credentials and bucket name must be configured in environment variables'
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Upload un fichier Buffer vers S3
   */
  async uploadBuffer(
    buffer: Buffer,
    s3Key: string,
    contentType: string = 'image/jpeg'
  ): Promise<{ success: boolean; url: string; s3Key: string; error?: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      const url = this.getCloudFrontUrl(s3Key);

      return {
        success: true,
        url,
        s3Key,
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      return {
        success: false,
        url: '',
        s3Key,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload un fichier depuis le filesystem vers S3
   */
  async uploadFile(
    localFilePath: string,
    s3Key: string,
    contentType: string = 'image/jpeg'
  ): Promise<{ success: boolean; url: string; s3Key: string; error?: string }> {
    try {
      const buffer = await readFile(localFilePath);
      return this.uploadBuffer(buffer, s3Key, contentType);
    } catch (error) {
      console.error('Error reading file:', error);
      return {
        success: false,
        url: '',
        s3Key,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Vérifie si un fichier existe sur S3
   */
  async fileExists(s3Key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Génère l'URL CloudFront pour un fichier S3
   */
  getCloudFrontUrl(s3Key: string): string {
    if (this.cloudFrontDomain) {
      return `https://${this.cloudFrontDomain}/${s3Key}`;
    }

    const region = process.env.AWS_REGION || 'eu-west-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
  }
}
