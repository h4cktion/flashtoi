"use server";

import { connectDB } from "@/lib/db/connect";
import Student from "@/lib/db/models/Student";
import Class from "@/lib/db/models/Class";
import { ActionResponse, IStudent, Photo, PhotoFormat } from "@/types";
import { verifyPassword } from "@/lib/auth/password";

/**
 * Helper to add class photos to student object
 */
export async function addClassPhotosToStudent(student: IStudent) {
  try {
    if (!student.classId || !student.schoolId) return student;

    // Find class document
    const classDoc = await Class.findOne({
      schoolId: student.schoolId,
      class_name: student.classId, // matching student.classId (string) to Class.class_name
    }).lean();

    if (classDoc && classDoc.photos && classDoc.photos.length > 0) {
      // Map class photos to Student Photo format
      // We create TWO entries for each photo:
      // 1. "groupe": for the new gallery display and logic
      // 2. "classe": for backward compatibility with existing packs that look for "classe"
      const classPhotos: Photo[] = classDoc.photos.flatMap((p) => [
        {
          s3Key: p.s3Key,
          cloudFrontUrl: p.cloudFrontUrl,
          format: "25x19" as PhotoFormat,
          price: 0,
          planche: "groupe",
        },
        {
          s3Key: p.s3Key,
          cloudFrontUrl: p.cloudFrontUrl,
          format: "25x19" as PhotoFormat,
          price: 0,
          planche: "classe",
        }
      ]);

      // Merge with existing photos
      student.photos = [...(student.photos || []), ...classPhotos];
    }
  } catch (error) {
    console.error("Error fetching class photos:", error);
    // Don't fail the whole request if class photos fail
  }
  return student;
}

/**
 * Récupère les données d'un étudiant par son ID
 */
export async function getStudentById(
  studentId: string
): Promise<ActionResponse<IStudent>> {
  try {
    await connectDB();

    const student = await Student.findById(studentId)
      .select("-password") // Ne pas retourner le mot de passe
      .lean();

    if (!student) {
      return {
        success: false,
        error: "Étudiant non trouvé",
      };
    }

    // Convertir en plain object pour éviter les problèmes de sérialisation
    let plainStudent = JSON.parse(JSON.stringify(student));
    
    // Add class photos
    plainStudent = await addClassPhotosToStudent(plainStudent);

    return {
      success: true,
      data: plainStudent,
    };
  } catch (error) {
    console.error("Error fetching student:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
  }
}

/**
 * Récupère les données d'un étudiant par son QR Code
 */
export async function getStudentByQrCode(
  qrCode: string
): Promise<ActionResponse<IStudent>> {
  try {
    await connectDB();

    const student = await Student.findOne({ qrCode })
      .select("-password") // Ne pas retourner le mot de passe
      .lean();

    if (!student) {
      return {
        success: false,
        error: "Élève non trouvé avec ce QR code",
      };
    }

    // Convertir en plain object pour éviter les problèmes de sérialisation
    let plainStudent = JSON.parse(JSON.stringify(student));

    // Add class photos
    plainStudent = await addClassPhotosToStudent(plainStudent);

    return {
      success: true,
      data: plainStudent,
    };
  } catch (error) {
    console.error("Error fetching student by QR code:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
  }
}

/**
 * Récupère les données d'un étudiant par son login et password
 */
export async function getStudentByLogin(
  loginCode: string,
  password: string
): Promise<ActionResponse<IStudent>> {
  try {
    await connectDB();

    // Rechercher l'étudiant par loginCode
    const student = await Student.findOne({ loginCode }).lean();

    if (!student) {
      return {
        success: false,
        error: "Identifiants incorrects",
      };
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await verifyPassword(password, student.password);

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Identifiants incorrects",
      };
    }

    // Convertir en plain object et retirer le password
    let plainStudent = JSON.parse(JSON.stringify(student));
    delete plainStudent.password;

    // Add class photos
    plainStudent = await addClassPhotosToStudent(plainStudent);

    return {
      success: true,
      data: plainStudent,
    };
  } catch (error) {
    console.error("Error fetching student by login:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
  }
}
