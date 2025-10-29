import { resend } from './resend'
import { OrderConfirmationEmail } from './templates/order-confirmation'
import { render } from '@react-email/components'
import * as React from 'react'

interface SendOrderConfirmationParams {
  to: string
  orderNumber: string
  studentName: string
  items: Array<{
    format: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  packs: Array<{
    packName: string
    quantity: number
    packPrice: number
    subtotal: number
    photosCount: number
  }>
  totalAmount: number
  paymentMethod: 'cash' | 'check' | 'online'
  notes?: string
}

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHtml = await render(
      React.createElement(OrderConfirmationEmail, {
        orderNumber: params.orderNumber,
        studentName: params.studentName,
        email: params.to,
        items: params.items,
        packs: params.packs,
        totalAmount: params.totalAmount,
        paymentMethod: params.paymentMethod,
        notes: params.notes,
      })
    )

    const { data, error } = await resend.emails.send({
      from: 'Flash Toi <onboarding@resend.dev>', // Remplacez par votre domaine vérifié
      to: [params.to],
      subject: `Confirmation de commande #${params.orderNumber}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
