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

/**
 * Get all orders for a school with student information
 */
export async function getSchoolOrders(schoolId: string): Promise<
  ActionResponse<
    Array<{
      _id: string
      orderNumber: string
      createdAt: string
      studentNames: string[]
      totalAmount: number
      paymentMethod: string
      status: string
      notes?: string
    }>
  >
> {
  try {
    await connectDB()

    // Récupérer toutes les commandes de l'école avec les IDs des étudiants
    const orders = await Order.find({ schoolId })
      .select(
        'orderNumber studentIds totalAmount paymentMethod status notes createdAt'
      )
      .sort({ createdAt: -1 })
      .lean()

    // Récupérer tous les étudiants pour mapper les noms
    const studentIds = [
      ...new Set(orders.flatMap((order) => order.studentIds)),
    ]
    const students = await Student.find({
      _id: { $in: studentIds },
    })
      .select('firstName lastName')
      .lean()

    // Helper types for populated/lean documents
    interface StudentDoc {
      _id: unknown
      firstName: string
      lastName: string
    }

    interface OrderDoc {
      _id: unknown
      orderNumber: string
      createdAt: Date
      studentIds: unknown[]
      totalAmount: number
      paymentMethod: string
      status: string
      notes?: string
    }

    // Créer un map des étudiants pour un accès rapide
    const studentMap = new Map(
      students.map((s: StudentDoc) => [
        s._id.toString(),
        `${s.firstName} ${s.lastName}`,
      ])
    )

    // Formatter les commandes avec les noms des étudiants
    const formattedOrders = orders.map((order: OrderDoc) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      studentNames: order.studentIds.map(
        (id: unknown) => studentMap.get(id.toString()) || 'Inconnu'
      ),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      status: order.status,
      notes: order.notes,
    }))

    return {
      success: true,
      data: formattedOrders,
    }
  } catch (error) {
    console.error('getSchoolOrders error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des commandes',
    }
  }
}

/**
 * Mark an order as paid
 */
export async function markOrderAsPaid(
  orderId: string,
  schoolId: string
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    await connectDB()

    // Vérifier que la commande appartient bien à cette école
    const order = await Order.findOne({ _id: orderId, schoolId }).lean()

    if (!order) {
      return {
        success: false,
        error: 'Commande non trouvée',
      }
    }

    // Vérifier que le paiement est en espèces ou chèque
    if (order.paymentMethod !== 'cash' && order.paymentMethod !== 'check') {
      return {
        success: false,
        error: 'Cette commande ne peut pas être marquée comme payée manuellement',
      }
    }

    // Vérifier que le statut est pending
    if (order.status !== 'pending') {
      return {
        success: false,
        error: 'Cette commande a déjà été traitée',
      }
    }

    // Mettre à jour le statut
    await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(),
        },
      }
    )

    return {
      success: true,
      data: { success: true },
    }
  } catch (error) {
    console.error('markOrderAsPaid error:', error)
    return {
      success: false,
      error: 'Erreur lors de la mise à jour de la commande',
    }
  }
}
