'use server'

import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/db/models/Order'
import Student from '@/lib/db/models/Student'
import { ActionResponse, OrderItem, OrderPackItem, PaymentMethod } from '@/types'

interface CreateOrderData {
  studentId: string
  items: OrderItem[]
  packs?: OrderPackItem[]
  totalAmount: number
  paymentMethod: PaymentMethod
  notes?: string
}

/**
 * Génère un numéro de commande unique
 */
async function generateOrderNumber(): Promise<string> {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // Format: ORD-YYYYMMDD-XXXXX
  const prefix = `ORD-${year}${month}${day}`

  // Trouver le dernier numéro de commande du jour
  const lastOrder = await Order.findOne({
    orderNumber: new RegExp(`^${prefix}`),
  })
    .sort({ orderNumber: -1 })
    .lean()

  let sequence = 1
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2])
    sequence = lastSequence + 1
  }

  return `${prefix}-${String(sequence).padStart(5, '0')}`
}

/**
 * Crée une nouvelle commande
 */
export async function createOrder(
  data: CreateOrderData
): Promise<ActionResponse<{ orderNumber: string; orderId: string }>> {
  try {
    await connectDB()

    // Vérifier que l'étudiant existe et récupérer son schoolId
    const student = await Student.findById(data.studentId).lean()
    if (!student) {
      return {
        success: false,
        error: 'Étudiant non trouvé',
      }
    }

    // Générer un numéro de commande unique
    const orderNumber = await generateOrderNumber()

    // Calculer les subtotals pour les items
    const itemsWithSubtotal = data.items.map((item) => ({
      ...item,
      subtotal: item.unitPrice * item.quantity,
    }))

    // Calculer les subtotals pour les packs
    const packsWithSubtotal = data.packs?.map((pack) => ({
      ...pack,
      subtotal: pack.packPrice * pack.quantity,
    }))

    // Créer la commande
    const order = await Order.create({
      orderNumber,
      studentIds: [data.studentId],
      schoolId: student.schoolId,
      items: itemsWithSubtotal,
      packs: packsWithSubtotal || [],
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      status: 'pending',
      notes: data.notes,
    })

    return {
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderId: order._id.toString(),
      },
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la création de la commande',
    }
  }
}
