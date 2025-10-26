'use server'

import { connectDB } from '@/lib/db/connect'
import Student from '@/lib/db/models/Student'
import { ActionResponse, IStudent } from '@/types'

/**
 * Récupère les données d'un étudiant par son ID
 */
export async function getStudentById(
  studentId: string
): Promise<ActionResponse<IStudent>> {
  try {
    await connectDB()

    const student = await Student.findById(studentId)
      .select('-password') // Ne pas retourner le mot de passe
      .lean()

    if (!student) {
      return {
        success: false,
        error: 'Étudiant non trouvé',
      }
    }

    // Convertir en plain object pour éviter les problèmes de sérialisation
    const plainStudent = JSON.parse(JSON.stringify(student))

    return {
      success: true,
      data: plainStudent,
    }
  } catch (error) {
    console.error('Error fetching student:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des données',
    }
  }
}
