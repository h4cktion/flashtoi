"use server";

import { z } from "zod";
import { signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";
import { ActionResponse } from "@/types";

// ============================================
// VALIDATION SCHEMA
// ============================================
const schoolLoginSchema = z.object({
  loginCode: z.string().min(1, "Login code is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ============================================
// SERVER ACTION - SCHOOL AUTHENTICATION
// ============================================

/**
 * Authenticate school with login code and password
 */
export async function authenticateSchool(
  loginCode: string,
  password: string
): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    // 1. Validate inputs
    const validated = schoolLoginSchema.parse({ loginCode, password });

    // 2. Attempt authentication
    const result = await signIn("school", {
      loginCode: validated.loginCode,
      password: validated.password,
      redirect: false,
    });

    if (!result || result.error) {
      return {
        success: false,
        error: "Identifiant ou mot de passe incorrect",
      };
    }

    return {
      success: true,
      data: { redirectUrl: "/school/dashboard" },
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

    console.error("authenticateSchool error:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}
