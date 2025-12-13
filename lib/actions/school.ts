"use server";

import { connectDB } from "@/lib/db/connect";
import School from "@/lib/db/models/School";
import Student from "@/lib/db/models/Student";
import Order from "@/lib/db/models/Order";
import { ActionResponse, ISchool, IStudent } from "@/types";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";

// ============================================
// TYPES
// ============================================
interface SchoolDashboardData {
  school: ISchool;
  students: IStudent[];
  stats: {
    totalStudents: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    classesList: string[];
  };
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
    await connectDB();

    // 1. Récupérer l'école
    const school = await School.findById(schoolId).lean();

    if (!school) {
      return {
        success: false,
        error: "École non trouvée",
      };
    }

    // 2. Récupérer tous les étudiants de cette école
    const students = await Student.find({ schoolId })
      .select("firstName lastName classId qrCode loginCode clearPassword photos thumbnail schoolId")
      .lean();

    // 3. Récupérer les commandes de cette école
    const orders = await Order.find({ schoolId })
      .select("totalAmount status createdAt")
      .lean();

    // 4. Calculer les statistiques
    const totalStudents = students.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;

    // Extraire la liste unique des classes
    const classesList = [
      ...new Set(students.map((student) => student.classId)),
    ].sort();

    // Convertir en plain objects pour éviter les problèmes de sérialisation
    const plainSchool = JSON.parse(JSON.stringify(school));
    const plainStudents = JSON.parse(JSON.stringify(students));

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
    };
  } catch (error) {
    console.error("getSchoolDashboard error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
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
    await connectDB();

    const students = await Student.find({ schoolId, classId })
      .select("firstName lastName qrCode loginCode clearPassword photos thumbnail schoolId")
      .lean();

    // Convertir en plain objects pour éviter les problèmes de sérialisation
    const plainStudents = JSON.parse(JSON.stringify(students));

    return {
      success: true,
      data: plainStudents,
    };
  } catch (error) {
    console.error("getStudentsByClass error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des étudiants",
    };
  }
}

/**
 * Get all orders for a school with student information
 */
export async function getSchoolOrders(schoolId: string): Promise<
  ActionResponse<
    Array<{
      _id: string;
      orderNumber: string;
      createdAt: string;
      studentNames: string[];
      totalAmount: number;
      paymentMethod: string;
      status: string;
      notes?: string;
    }>
  >
> {
  try {
    await connectDB();

    // Récupérer toutes les commandes de l'école avec les IDs des étudiants
    const orders = await Order.find({ schoolId })
      .select(
        "orderNumber studentIds totalAmount paymentMethod status notes createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Récupérer tous les étudiants pour mapper les noms
    const studentIds = [
      ...new Set(orders.flatMap((order) => order.studentIds)),
    ];
    const students = await Student.find({
      _id: { $in: studentIds },
    })
      .select("firstName lastName")
      .lean();

    // Helper types for populated/lean documents
    interface StudentDoc {
      _id: { toString(): string };
      firstName: string;
      lastName: string;
    }

    interface OrderDoc {
      _id: { toString(): string };
      orderNumber: string;
      createdAt: Date;
      studentIds: Array<{ toString(): string }>;
      totalAmount: number;
      paymentMethod: string;
      status: string;
      notes?: string;
    }

    // Créer un map des étudiants pour un accès rapide
    const studentMap = new Map(
      students.map((s: StudentDoc) => [
        s._id.toString(),
        `${s.firstName} ${s.lastName}`,
      ])
    );

    // Formatter les commandes avec les noms des étudiants
    const formattedOrders = orders.map((order: OrderDoc) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      studentNames: order.studentIds.map(
        (id) => studentMap.get(id.toString()) || "Inconnu"
      ),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      status: order.status,
      notes: order.notes,
    }));

    return {
      success: true,
      data: formattedOrders,
    };
  } catch (error) {
    console.error("getSchoolOrders error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des commandes",
    };
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
    await connectDB();

    // Vérifier que la commande appartient bien à cette école
    const order = await Order.findOne({ _id: orderId, schoolId }).lean();

    if (!order) {
      return {
        success: false,
        error: "Commande non trouvée",
      };
    }

    // Vérifier que le paiement est en espèces ou chèque
    if (order.paymentMethod !== "cash" && order.paymentMethod !== "check") {
      return {
        success: false,
        error:
          "Cette commande ne peut pas être marquée comme payée manuellement",
      };
    }

    // Vérifier que le statut est pending
    if (order.status !== "pending") {
      return {
        success: false,
        error: "Cette commande a déjà été traitée",
      };
    }

    // Mettre à jour le statut
    await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          status: "paid",
          paidAt: new Date(),
        },
      }
    );

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("markOrderAsPaid error:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la commande",
    };
  }
}

/**
 * Update order payment status (paid <-> pending)
 * Only for cash/check payments
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  schoolId: string,
  newStatus: "paid" | "pending"
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    await connectDB();

    // Vérifier que la commande appartient bien à cette école
    const order = await Order.findOne({ _id: orderId, schoolId }).lean();

    if (!order) {
      return {
        success: false,
        error: "Commande non trouvée",
      };
    }

    // Vérifier que le paiement est en espèces ou chèque
    if (order.paymentMethod !== "cash" && order.paymentMethod !== "check") {
      return {
        success: false,
        error: "Seules les commandes par chèque ou espèces peuvent être modifiées",
      };
    }

    // Vérifier que le statut actuel permet la modification
    if (order.status !== "pending" && order.status !== "paid") {
      return {
        success: false,
        error: "Le statut de cette commande ne peut plus être modifié",
      };
    }

    // Mettre à jour le statut
    await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          status: newStatus,
          paidAt: newStatus === "paid" ? new Date() : null,
        },
      }
    );

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("updateOrderPaymentStatus error:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la commande",
    };
  }
}

/**
 * Update school RIB
 */
export async function updateSchoolRib(
  schoolId: string,
  rib: string
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    await connectDB();

    await School.findByIdAndUpdate(schoolId, {
      $set: { rib },
    });

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("updateSchoolRib error:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du RIB",
    };
  }
}
/**
 * Generate student coupon with QR code
 */
export async function generateStudentCoupon(
  studentId: string,
  schoolId: string
): Promise<ActionResponse<{ imageBase64: string }>> {
  try {
    await connectDB();

    // 1. Récupérer l'étudiant avec son mot de passe en clair
    const student = await Student.findOne({ _id: studentId, schoolId }).lean();

    if (!student) {
      return {
        success: false,
        error: "Étudiant non trouvé",
      };
    }

    // 2. Récupérer le template "coupon"
    const Template = (await import("@/lib/db/models/Template")).default;
    const template = await Template.findOne({ planche: "coupon" }).lean();

    if (!template) {
      return {
        success: false,
        error: "Modèle de coupon non trouvé",
      };
    }

    // 3. Générer le QR Code
    const QRCode = await import("qrcode");
    const qrCodeBuffer = await QRCode.toBuffer(student.qrCode, {
      width: 300,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // 4. Créer l'image du coupon avec Sharp
    const sharp = (await import("sharp")).default;
    
    let backgroundBuffer;
    let width = 1200;
    let height = 800;

    // Essayer de récupérer l'image de fond depuis S3 si disponible
    if (template.backgroundS3Url) {
      try {
        const response = await fetch(template.backgroundS3Url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          backgroundBuffer = Buffer.from(arrayBuffer);
          
          // Récupérer les dimensions de l'image
          const metadata = await sharp(backgroundBuffer).metadata();
          width = metadata.width || 1200;
          height = metadata.height || 800;
        }
      } catch (err) {
        console.error("Erreur lors du téléchargement du background:", err);
      }
    }

    const passwordText = student.clearPassword || "Non défini";
    
    // Si on a un background, on l'utilise, sinon on génère un SVG blanc
    let baseImageInput;
    
    if (backgroundBuffer) {
      baseImageInput = backgroundBuffer;
    } else {
      // Fallback SVG blanc
      const whiteSvg = `
      <svg width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="white" />
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#E5E7EB" stroke-width="4" rx="20" />
        <text x="${width / 2}" y="100" text-anchor="middle" font-size="48" font-family="sans-serif" font-weight="bold" fill="#111827">COUPON D'ACCÈS PHOTOS</text>
      </svg>
      `;
      baseImageInput = Buffer.from(whiteSvg);
    }

    // Créer le calque de texte (SVG transparent)
    // On ajuste les positions en fonction de la taille de l'image (si possible)
    // Pour l'instant on garde les positions fixes qui marchent pour du 10x15 (1200x1800) ou 15x10 (1800x1200)
    // On va supposer que le template coupon est au format paysage standard
    
    const textOverlay = `
    <svg width="${width}" height="${height}">
      <style>
        .title { fill: #111827; font-size: 48px; font-family: sans-serif; font-weight: bold; }
        .label { fill: #4B5563; font-size: 32px; font-family: sans-serif; }
        .value { fill: #111827; font-size: 36px; font-family: sans-serif; font-weight: bold; }
        .code-label { fill: #6B7280; font-size: 24px; font-family: sans-serif; text-anchor: middle; }
        .code-value { fill: #111827; font-size: 48px; font-family: monospace; font-weight: bold; text-anchor: middle; }
        .footer { fill: #6B7280; font-size: 24px; font-family: sans-serif; text-anchor: middle; }
      </style>
      
      <!-- Si pas de background, on a déjà le titre dans le fallback, sinon on peut le remettre ou l'adapter -->
      ${!backgroundBuffer ? '' : `<text x="${width / 2}" y="100" text-anchor="middle" class="title">COUPON D'ACCÈS PHOTOS</text>`}
      
      <!-- Infos Élève -->
      <text x="100" y="200" class="label">Élève :</text>
      <text x="100" y="250" class="value">${student.firstName} ${student.lastName}</text>
      
      <text x="100" y="320" class="label">Classe :</text>
      <text x="100" y="370" class="value">${student.classId}</text>
      
      <!-- Identifiants -->
      <text x="330" y="500" class="code-label">Code de connexion</text>
      <text x="330" y="560" class="code-value">${student.loginCode}</text>
      
      <text x="330" y="600" class="code-label">Mot de passe</text>
      <text x="330" y="660" class="code-value">${passwordText}</text>
      
      <!-- Footer -->
      <text x="${width / 2}" y="${height - 50}" class="footer">Connectez-vous sur photos.ecole.fr</text>
    </svg>
    `;

    const imageBuffer = await sharp(baseImageInput)
      .composite([
        {
          input: Buffer.from(textOverlay),
          top: 0,
          left: 0,
        },
        {
          input: qrCodeBuffer,
          top: 200,
          left: 700, // Position approximative à droite
        },
      ])
      .png()
      .toBuffer();

    // 4. Retourner l'image en base64
    return {
      success: true,
      data: {
        imageBase64: `data:image/png;base64,${imageBuffer.toString("base64")}`,
      },
    };
  } catch (error) {
    console.error("generateStudentCoupon error:", error);
    return {
      success: false,
      error: "Erreur lors de la génération du coupon",
    };
  }
}

/**
 * Met à jour les informations de l'établissement
 */
export async function updateSchoolDetails(
  schoolId: string,
  data: {
    address: string;
    phone: string;
    email: string;
  }
): Promise<ActionResponse<void>> {
  try {
    const session = await auth();
    if (!session || session.user.role !== "school" || session.user.schoolId !== schoolId) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    await connectDB();

    await School.findByIdAndUpdate(schoolId, {
      $set: {
        address: data.address,
        phone: data.phone,
        email: data.email,
      },
    });

    revalidatePath("/school/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating school details:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des informations",
    };
  }
}
