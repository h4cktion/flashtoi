"use server";

import { connectDB } from "@/lib/db/connect";
import Student from "@/lib/db/models/Student";
import { ActionResponse, IStudent } from "@/types";
import { verifyPassword } from "@/lib/auth/password";

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
    const plainStudent = JSON.parse(JSON.stringify(student));

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
    const plainStudent = JSON.parse(JSON.stringify(student));

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
    const plainStudent = JSON.parse(JSON.stringify(student));
    delete plainStudent.password;

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
