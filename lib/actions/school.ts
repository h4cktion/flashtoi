'use server'

import { connectDB } from '@/lib/db/connect'
import School from '@/lib/db/models/School'
import Student from '@/lib/db/models/Student'
import Order from '@/lib/db/models/Order'
import { ActionResponse, ISchool, IStudent } from '@/types'

// ============================================
// TYPES
// ============================================
interface SchoolDashboardData {
  school: ISchool
  students: IStudent[]
  stats: {
    totalStudents: number
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    classesList: string[]
  }
}

// ============================================
// SERVER ACTIONS - SCHOOL
// ============================================

/**
 * Get school dashboard data
 */
export async function getSchoolDashboard(
  schoolId: string
): Promise<ActionResponse<SchoolDashboardData>> {
  try {
    await connectDB()

    // 1. Récupérer l'école
    const school = await School.findById(schoolId).lean()

    if (!school) {
      return {
        success: false,
        error: 'École non trouvée',
      }
    }

    // 2. Récupérer tous les étudiants de cette école
    const students = await Student.find({ schoolId })
      .select('firstName lastName classId qrCode loginCode photos')
      .lean()

    // 3. Récupérer les commandes de cette école
    const orders = await Order.find({ schoolId })
      .select('totalAmount status createdAt')
      .lean()

    // 4. Calculer les statistiques
    const totalStudents = students.length
    const totalOrders = orders.length
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    )
    const pendingOrders = orders.filter(
      (order) => order.status === 'pending'
    ).length

    // Extraire la liste unique des classes
    const classesList = [
      ...new Set(students.map((student) => student.classId)),
    ].sort()

    // Convertir en plain objects pour éviter les problèmes de sérialisation
    const plainSchool = JSON.parse(JSON.stringify(school))
    const plainStudents = JSON.parse(JSON.stringify(students))

    return {
      success: true,
      data: {
        school: plainSchool,
        students: plainStudents,
        stats: {
          totalStudents,
          totalOrders,
          totalRevenue,
          pendingOrders,
          classesList,
        },
      },
    }
  } catch (error) {
    console.error('getSchoolDashboard error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des données',
    }
  }
}

/**
 * Get students by class
 */
export async function getStudentsByClass(
  schoolId: string,
  classId: string
): Promise<ActionResponse<IStudent[]>> {
  try {
    await connectDB()

    const students = await Student.find({ schoolId, classId })
      .select('firstName lastName qrCode loginCode photos')
      .lean()

    // Convertir en plain objects pour éviter les problèmes de sérialisation
    const plainStudents = JSON.parse(JSON.stringify(students))

    return {
      success: true,
      data: plainStudents,
    }
  } catch (error) {
    console.error('getStudentsByClass error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des étudiants',
    }
  }
}
