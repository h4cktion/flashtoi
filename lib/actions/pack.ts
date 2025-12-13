"use server";

import { connectDB } from "@/lib/db/connect";
import Pack from "@/lib/db/models/Pack";
import Student from "@/lib/db/models/Student";
import Template from "@/lib/db/models/Template";
import mongoose from "mongoose";
import { ActionResponse, Pack as PackType, Photo, PhotoFormat, PhotoPlanche, IStudent } from "@/types";
import { addClassPhotosToStudent } from "./student";

// Type for photo structure in the database
interface StudentPhoto {
  planche: PhotoPlanche;
  s3Key: string;
  cloudFrontUrl: string;
  format: PhotoFormat;
  price: number;
}

/**
 * Récupère tous les packs disponibles pour un étudiant
 * Retourne uniquement les packs dont l'étudiant possède toutes les planches requises
 */
export async function getAvailablePacksForStudent(
  studentId: string
): Promise<ActionResponse<PackType[]>> {
  try {
    // Valider que l'ID est un ObjectId MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        error: "ID étudiant invalide",
      };
    }

    await connectDB();

    // Récupérer l'étudiant et ses photos
    let student = (await Student.findById(studentId).lean()) as IStudent | null;

    if (!student) {
      return {
        success: false,
        error: "Étudiant non trouvé",
      };
    }

    // Add class photos
    student = await addClassPhotosToStudent(student);

    // Récupérer tous les packs, triés par ordre
    const allPacks = await Pack.find({}).sort({ order: 1 }).lean();

    const availablePacks: PackType[] = [];

    // Pour chaque pack, vérifier si l'étudiant possède toutes les planches requises
    for (const pack of allPacks) {
      // Obtenir les planches disponibles pour cet étudiant
      const studentPlanches = new Set(
        student.photos?.map((photo: StudentPhoto) => photo.planche) || []
      );

      // Vérifier si toutes les planches du pack sont disponibles
      const hasAllPlanches = pack.planches.every((planche) =>
        studentPlanches.has(planche)
      );

      if (hasAllPlanches) {
        // Récupérer les photos correspondant aux planches du pack
        // Récupérer les photos correspondant aux planches du pack
        const packPhotos: Photo[] = (student.photos || [])
          .filter((photo: StudentPhoto) =>
            pack.planches.includes(photo.planche)
          )
          .map((photo: StudentPhoto) => ({
            s3Key: photo.s3Key,
            cloudFrontUrl: photo.cloudFrontUrl,
            format: photo.format,
            price: photo.price,
            planche: photo.planche,
          }));

        availablePacks.push({
          pack: {
            _id: pack._id.toString(),
            name: pack.name,
            price: pack.price,
            description: pack.description,
            planches: pack.planches,
            order: pack.order,
            createdAt: pack.createdAt,
            updatedAt: pack.updatedAt,
          },
          photos: packPhotos,
        });
      }
    }

    return {
      success: true,
      data: availablePacks,
    };
  } catch (error) {
    console.error("Error fetching packs:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des packs",
    };
  }
}

/**
 * Récupère tous les packs disponibles pour un étudiant (version CSS)
 * Basé sur les templates disponibles au lieu des photos pré-générées
 */
export async function getAvailablePacksForStudentCss(
  studentId: string
): Promise<ActionResponse<PackType[]>> {
  try {
    // Valider que l'ID est un ObjectId MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        error: "ID étudiant invalide",
      };
    }

    await connectDB();

    // Récupérer l'étudiant
    let student = (await Student.findById(studentId).lean()) as IStudent | null;

    if (!student) {
      return {
        success: false,
        error: "Étudiant non trouvé",
      };
    }
    
    // Add class photos
    student = await addClassPhotosToStudent(student);

    // Récupérer tous les templates disponibles
    const allTemplates = await Template.find({}).lean();
    const availableTemplates = new Set(
      allTemplates.map((t) => t.planche)
    );

    // Récupérer les photos de classe
    // Récupérer les photos de classe (logic moved to inside loop)

    // Récupérer tous les packs, triés par ordre
    const allPacks = await Pack.find({}).sort({ order: 1 }).lean();

    const availablePacks: PackType[] = [];

    // Pour chaque pack, vérifier si tous les templates requis existent
    for (const pack of allPacks) {
      // Vérifier si toutes les planches du pack ont un template disponible ou sont des photos statiques
      const hasAllTemplates = pack.planches.every((planche) => {
        if (planche === "classe") return true; // Classe est toujours considérée (vérifiée dans la boucle)
        if (planche === "groupe") return true; // Groupe est toujours considéré
        return availableTemplates.has(planche);
      });

      if (hasAllTemplates) {
        // Créer des "photos virtuelles" pour le pack
        const packPhotos: Photo[] = [];

        for (const planche of pack.planches) {
          // Cas spécial : photo de classe ou de groupe (ajouter TOUTES les photos correspondantes)
          if ((planche === "classe" || planche === "groupe")) {
            const staticPhotos = (student?.photos || []).filter(
              (p: StudentPhoto) => p.planche === planche
            );

            if (staticPhotos.length > 0) {
              staticPhotos.forEach((photo: StudentPhoto) => {
                packPhotos.push({
                  s3Key: photo.s3Key,
                  cloudFrontUrl: photo.cloudFrontUrl,
                  format: photo.format,
                  price: photo.price,
                  planche: planche,
                });
              });
            }
          } else {
            // Pour les autres planches, créer une photo virtuelle
            const template = allTemplates.find((t) => t.planche === planche);
            packPhotos.push({
              s3Key: "", // Pas nécessaire avec le CSS
              cloudFrontUrl: `/api/generate-planche?studentId=${studentId}&planche=${planche}`,
              format: (template?.format || "25x19") as PhotoFormat,
              price: template?.price || 0,
              planche: planche,
            });
          }
        }

        availablePacks.push({
          pack: {
            _id: pack._id.toString(),
            name: pack.name,
            price: pack.price,
            description: pack.description,
            planches: pack.planches,
            order: pack.order,
            createdAt: pack.createdAt,
            updatedAt: pack.updatedAt,
          },
          photos: packPhotos,
        });
      }
    }

    return {
      success: true,
      data: availablePacks,
    };
  } catch (error) {
    console.error("Error fetching CSS packs:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des packs CSS",
    };
  }
}

/**
 * Récupère un pack spécifique par son ID
 */
export async function getPackById(
  packId: string
): Promise<ActionResponse<PackType["pack"]>> {
  try {
    if (!mongoose.Types.ObjectId.isValid(packId)) {
      return {
        success: false,
        error: "ID pack invalide",
      };
    }

    await connectDB();

    const pack = await Pack.findById(packId).lean();

    if (!pack) {
      return {
        success: false,
        error: "Pack non trouvé",
      };
    }

    return {
      success: true,
      data: {
        _id: pack._id.toString(),
        name: pack.name,
        price: pack.price,
        description: pack.description,
        planches: pack.planches,
        order: pack.order,
        createdAt: pack.createdAt,
        updatedAt: pack.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error fetching pack:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du pack",
    };
  }
}

/**
 * Récupère tous les packs (admin)
 */
export async function getAllPacks(): Promise<
  ActionResponse<PackType["pack"][]>
> {
  try {
    await connectDB();

    const packs = await Pack.find({}).sort({ order: 1 }).lean();

    const formattedPacks = packs.map((pack) => ({
      _id: pack._id.toString(),
      name: pack.name,
      price: pack.price,
      description: pack.description,
      planches: pack.planches,
      order: pack.order,
      createdAt: pack.createdAt,
      updatedAt: pack.updatedAt,
    }));

    return {
      success: true,
      data: formattedPacks,
    };
  } catch (error) {
    console.error("Error fetching all packs:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des packs",
    };
  }
}
