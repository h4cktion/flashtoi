"use server";

import { z } from "zod";
import { signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";
import { ActionResponse } from "@/types";

// ============================================
// VALIDATION SCHEMA
// ============================================
const adminLoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// ============================================
// SERVER ACTION - ADMIN AUTHENTICATION
// ============================================

/**
 * Authenticate admin with email and password
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    // 1. Validate inputs
    const validated = adminLoginSchema.parse({ email, password });

    // 2. Attempt authentication
    const result = await signIn("admin", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    if (!result || result.error) {
      return {
        success: false,
        error: "Email ou mot de passe incorrect",
      };
    }

    return {
      success: true,
      data: { redirectUrl: "/backoffice/dashboard" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Erreur d'authentification",
      };
    }

    console.error("authenticateAdmin error:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}
