'use server'

import { connectDB } from '@/lib/db/connect'
import School from '@/lib/db/models/School'
import Student from '@/lib/db/models/Student'
import Order from '@/lib/db/models/Order'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { ActionResponse } from '@/types'

// ============================================
// TYPES
// ============================================

export interface SchoolWithStats {
  _id: string
  name: string
  loginCode: string
  createdAt: string
  studentsCount: number
  ordersCount: number
  totalRevenue: number
  pendingOrders: number
  paidOrders: number
}

export interface GlobalStats {
  totalSchools: number
  totalStudents: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  paidOrders: number
  pendingRevenue: number
  paidRevenue: number
}

export interface StudentWithDetails {
  _id: string
  firstName: string
  lastName: string
  loginCode: string
  classId: string
  schoolName: string
  schoolId: string
  photoUrl: string | null
  hasOrder: boolean
  orderStatus: string | null
  orderAmount: number | null
  createdAt: string
}

export interface OrderWithDetails {
  _id: string
  orderNumber: string
  schoolName: string
  schoolId: string
  studentNames: string[]
  totalAmount: number
  paymentMethod: string
  status: string
  itemsCount: number
  packsCount: number
  notes: string | null
  createdAt: string
  paidAt: string | null
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get all schools with their statistics
 * Admin only
 */
export async function getAllSchoolsForAdmin(): Promise<
  ActionResponse<{ schools: SchoolWithStats[] }>
> {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      redirect('/backoffice/login')
    }

    // 2. Connect to database
    await connectDB()

    // 3. Fetch all schools
    const schools = await School.find({}).sort({ createdAt: -1 }).lean()

    // 4. Get statistics for each school
    const schoolsWithStats: SchoolWithStats[] = await Promise.all(
      schools.map(async (school) => {
        // Use ObjectId for queries
        const schoolId = school._id

        // Count students
        const studentsCount = await Student.countDocuments({ schoolId })

        // Get orders
        const orders = await Order.find({ schoolId })
          .select('totalAmount status')
          .lean()

        // Calculate order statistics
        const ordersCount = orders.length
        const pendingOrders = orders.filter((o) => o.status === 'pending').length
        const paidOrders = orders.filter((o) => o.status === 'paid').length

        // Calculate revenue
        const totalRevenue = orders.reduce((sum, order) => {
          const amount = order.totalAmount ?? 0
          // Debug log for missing totalAmount
          if (!order.totalAmount && order.totalAmount !== 0) {
            console.log(`Order without totalAmount:`, order)
          }
          return sum + amount
        }, 0)

        return {
          _id: schoolId.toString(),
          name: school.name,
          loginCode: school.loginCode,
          createdAt: school.createdAt ? new Date(school.createdAt).toISOString() : new Date().toISOString(),
          studentsCount,
          ordersCount,
          totalRevenue,
          pendingOrders,
          paidOrders,
        }
      })
    )

    return {
      success: true,
      data: { schools: schoolsWithStats },
    }
  } catch (error) {
    console.error('getAllSchoolsForAdmin error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des écoles',
    }
  }
}

/**
 * Get global statistics
 * Admin only
 */
export async function getGlobalStats(): Promise<ActionResponse<{ stats: GlobalStats }>> {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      redirect('/backoffice/login')
    }

    // 2. Connect to database
    await connectDB()

    // 3. Get counts
    const totalSchools = await School.countDocuments()
    const totalStudents = await Student.countDocuments()
    const totalOrders = await Order.countDocuments()

    // 4. Get all orders for revenue calculations
    const allOrders = await Order.find({})
      .select('totalAmount status')
      .lean()

    const pendingOrders = allOrders.filter((o) => o.status === 'pending')
    const paidOrders = allOrders.filter((o) => o.status === 'paid')

    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0)
    const pendingRevenue = pendingOrders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0)
    const paidRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0)

    const stats: GlobalStats = {
      totalSchools,
      totalStudents,
      totalOrders,
      totalRevenue,
      pendingOrders: pendingOrders.length,
      paidOrders: paidOrders.length,
      pendingRevenue,
      paidRevenue,
    }

    return {
      success: true,
      data: { stats },
    }
  } catch (error) {
    console.error('getGlobalStats error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
    }
  }
}

/**
 * Get all students with their details
 * Admin only
 */
export async function getAllStudentsForAdmin(): Promise<
  ActionResponse<{ students: StudentWithDetails[] }>
> {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      redirect('/backoffice/login')
    }

    // 2. Connect to database
    await connectDB()

    // 3. Fetch all students with school info
    const students = await Student.find({})
      .populate('schoolId', 'name')
      .sort({ createdAt: -1 })
      .lean()

    // 4. Get orders for all students
    const studentIds = students.map((s) => s._id)
    const orders = await Order.find({ studentIds: { $in: studentIds } })
      .select('studentIds totalAmount status')
      .lean()

    // 5. Create a map of student orders
    const studentOrdersMap = new Map()
    orders.forEach((order) => {
      order.studentIds.forEach((studentId) => {
        const sid = studentId.toString()
        if (!studentOrdersMap.has(sid)) {
          studentOrdersMap.set(sid, {
            hasOrder: true,
            status: order.status,
            amount: order.totalAmount ?? 0,
          })
        }
      })
    })

    // 6. Build students with details
    const studentsWithDetails: StudentWithDetails[] = students.map((student) => {
      const studentId = student._id.toString()
      const orderInfo = studentOrdersMap.get(studentId)

      // Find planche1 photo
      const planche1 = student.photos?.find((photo) => photo.planche === 'planche1')

      return {
        _id: studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        loginCode: student.loginCode,
        classId: student.classId,
        schoolName: (student.schoolId as any)?.name || 'N/A',
        schoolId: (student.schoolId as any)?._id?.toString() || '',
        photoUrl: planche1?.cloudFrontUrl || null,
        hasOrder: orderInfo?.hasOrder || false,
        orderStatus: orderInfo?.status || null,
        orderAmount: orderInfo?.amount || null,
        createdAt: student.createdAt ? new Date(student.createdAt).toISOString() : new Date().toISOString(),
      }
    })

    return {
      success: true,
      data: { students: studentsWithDetails },
    }
  } catch (error) {
    console.error('getAllStudentsForAdmin error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des étudiants',
    }
  }
}

/**
 * Get all orders with their details
 * Admin only
 */
export async function getAllOrdersForAdmin(): Promise<
  ActionResponse<{ orders: OrderWithDetails[] }>
> {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      redirect('/backoffice/login')
    }

    // 2. Connect to database
    await connectDB()

    // 3. Fetch all orders with school and student info
    const orders = await Order.find({})
      .populate('schoolId', 'name')
      .populate('studentIds', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean()

    // 4. Build orders with details
    const ordersWithDetails: OrderWithDetails[] = orders.map((order) => {
      // Get student names
      const studentNames = Array.isArray(order.studentIds)
        ? (order.studentIds as any[])
            .filter((student) => student && student.firstName && student.lastName)
            .map((student) => `${student.firstName} ${student.lastName}`)
        : []

      return {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        schoolName: (order.schoolId as any)?.name || 'N/A',
        schoolId: (order.schoolId as any)?._id?.toString() || '',
        studentNames: studentNames.length > 0 ? studentNames : ['N/A'],
        totalAmount: order.totalAmount ?? 0,
        paymentMethod: order.paymentMethod,
        status: order.status,
        itemsCount: order.items?.length || 0,
        packsCount: order.packs?.length || 0,
        notes: order.notes || null,
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : null,
      }
    })

    return {
      success: true,
      data: { orders: ordersWithDetails },
    }
  } catch (error) {
    console.error('getAllOrdersForAdmin error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des commandes',
    }
  }
}
