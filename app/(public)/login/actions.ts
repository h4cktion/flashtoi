'use server'

import { z } from 'zod'
import { signIn } from '@/lib/auth/auth'
import { AuthError } from 'next-auth'
import { ActionResponse } from '@/types'

// ============================================
// VALIDATION SCHEMAS
// ============================================
const qrCodeSchema = z.object({
  qrCode: z.string().min(1, 'QR code is required'),
  password: z.string().min(1, 'Password is required'),
})

const credentialsSchema = z.object({
  loginCode: z.string().min(1, 'Login code is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

// ============================================
// SERVER ACTIONS - PARENT AUTHENTICATION
// ============================================

/**
 * Authenticate parent with QR code
 */
export async function authenticateWithQRCode(
  qrCode: string,
  password: string
): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    // 1. Validate inputs
    const validated = qrCodeSchema.parse({ qrCode, password })

    // 2. Attempt authentication
    const result = await signIn('parent', {
      identifier: validated.qrCode,
      password: validated.password,
      redirect: false,
    })

    if (!result || result.error) {
      return {
        success: false,
        error: 'QR code ou mot de passe incorrect',
      }
    }

    return {
      success: true,
      data: { redirectUrl: '/gallery' },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    if (error instanceof AuthError) {
      return {
        success: false,
        error: 'Erreur d\'authentification',
      }
    }

    console.error('authenticateWithQRCode error:', error)
    return {
      success: false,
      error: 'Une erreur est survenue',
    }
  }
}

/**
 * Authenticate parent with login code and password
 */
export async function authenticateWithCredentials(
  loginCode: string,
  password: string
): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    // 1. Validate inputs
    const validated = credentialsSchema.parse({ loginCode, password })

    // 2. Attempt authentication
    const result = await signIn('parent', {
      identifier: validated.loginCode,
      password: validated.password,
      redirect: false,
    })

    if (!result || result.error) {
      return {
        success: false,
        error: 'Identifiant ou mot de passe incorrect',
      }
    }

    return {
      success: true,
      data: { redirectUrl: '/gallery' },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    if (error instanceof AuthError) {
      return {
        success: false,
        error: 'Erreur d\'authentification',
      }
    }

    console.error('authenticateWithCredentials error:', error)
    return {
      success: false,
      error: 'Une erreur est survenue',
    }
  }
}
