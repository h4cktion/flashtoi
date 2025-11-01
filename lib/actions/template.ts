"use server";

import { connectDB } from "@/lib/db/mongodb";
import Template from "@/lib/db/models/Template";
import { ITemplate, ActionResponse } from "@/types";

/**
 * Récupère tous les templates triés par ordre d'affichage
 */
export async function getTemplates(): Promise<ActionResponse<ITemplate[]>> {
  try {
    await connectDB();

    const templates = await Template.find({}).sort({ order: 1 }).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(templates)) as ITemplate[],
    };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des templates",
    };
  }
}

/**
 * Récupère un template par son nom de planche
 */
export async function getTemplateByPlanche(
  planche: string
): Promise<ActionResponse<ITemplate>> {
  try {
    await connectDB();

    const template = await Template.findOne({ planche }).lean();

    if (!template) {
      return {
        success: false,
        error: `Template non trouvé: ${planche}`,
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(template)) as ITemplate,
    };
  } catch (error) {
    console.error("Error fetching template:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du template",
    };
  }
}

/**
 * Crée un nouveau template
 */
export async function createTemplate(
  templateData: Omit<ITemplate, "_id" | "createdAt" | "updatedAt">
): Promise<ActionResponse<ITemplate>> {
  try {
    await connectDB();

    const template = await Template.create(templateData);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(template)) as ITemplate,
    };
  } catch (error) {
    console.error("Error creating template:", error);
    return {
      success: false,
      error: "Erreur lors de la création du template",
    };
  }
}

/**
 * Met à jour un template
 */
export async function updateTemplate(
  planche: string,
  updates: Partial<ITemplate>
): Promise<ActionResponse<ITemplate>> {
  try {
    await connectDB();

    const template = await Template.findOneAndUpdate(
      { planche },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!template) {
      return {
        success: false,
        error: `Template non trouvé: ${planche}`,
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(template)) as ITemplate,
    };
  } catch (error) {
    console.error("Error updating template:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du template",
    };
  }
}
