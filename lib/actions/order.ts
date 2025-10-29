'use server'

import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/db/models/Order'
import Student from '@/lib/db/models/Student'
import { ActionResponse, OrderItem, OrderPackItem, PaymentMethod } from '@/types'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation'

interface CreateOrderData {
  studentId: string
  email: string
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
      email: data.email,
      items: itemsWithSubtotal,
      packs: packsWithSubtotal || [],
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      status: 'pending',
      notes: data.notes,
    })

    // Envoyer l'email de confirmation
    console.log('📧 [Order] Envoi email de confirmation à:', data.email)
    const emailResult = await sendOrderConfirmationEmail({
      to: data.email,
      orderNumber: order.orderNumber,
      studentName: `${student.firstName} ${student.lastName}`,
      items: itemsWithSubtotal.map((item) => ({
        format: item.format,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      packs: (packsWithSubtotal || []).map((pack) => ({
        packName: pack.packName,
        quantity: pack.quantity,
        packPrice: pack.packPrice,
        subtotal: pack.subtotal,
        photosCount: pack.photosCount,
      })),
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    })

    if (!emailResult.success) {
      console.error('❌ [Order] Erreur envoi email:', emailResult.error)
      // On ne fait pas échouer la commande si l'email ne part pas
      // La commande est créée avec succès même si l'email échoue
    } else {
      console.log('✅ [Order] Email envoyé avec succès')
    }

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
