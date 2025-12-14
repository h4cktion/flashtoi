"use server";

import { connectDB } from "@/lib/db/connect";
import School from "@/lib/db/models/School";
import Student from "@/lib/db/models/Student";
import Order from "@/lib/db/models/Order";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ActionResponse, OrderItem, OrderPackItem } from "@/types";
import { Types } from "mongoose";

// ============================================
// TYPES
// ============================================

export interface SchoolWithStats {
  _id: string;
  name: string;
  loginCode: string;
  createdAt: string;
  studentsCount: number;
  ordersCount: number;
  totalRevenue: number;
  paidRevenue: number;
  schoolPayment: number;
  pendingOrders: number;
  paidOrders: number;
  studentsWithOrdersCount: number;
}

// Helper types for populated fields
interface PopulatedSchool {
  _id: string;
  name: string;
}

interface PopulatedStudent {
  firstName: string;
  lastName: string;
  thumbnail?: {
    cloudFrontUrl: string;
  };
  photos?: {
    cloudFrontUrl: string;
  }[];
}

export interface GlobalStats {
  totalSchools: number;
  totalStudents: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  paidOrders: number;
  pendingRevenue: number;
  paidRevenue: number;
}

export interface StudentWithDetails {
  _id: string;
  firstName: string;
  lastName: string;
  loginCode: string;
  clearPassword?: string;
  hasLoggedIn?: boolean;
  classId: string;
  schoolName: string;
  schoolId: string;
  photoUrl: string | null;
  hasOrder: boolean;
  orderStatus: string | null;
  orderAmount: number | null;
  createdAt: string;
}

export interface OrderWithDetails {
  _id: string;
  orderNumber: string;
  schoolName: string;
  schoolId: string;
  studentNames: string[];
  studentPhotos: (string | null)[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  itemsCount: number;
  packsCount: number;
  notes: string | null;
  createdAt: string;
  paidAt: string | null;
  itemTypes: string[];
  items: OrderItemDetails[];
  packs: OrderPackDetails[];
}

export interface OrderItemDetails {
  _id?: string;
  photoUrl: string;
  format: string;
  plancheName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  student_id: string;
  classId: string;
}

export interface OrderPackDetails {
  _id?: string;
  packId: string;
  packName: string;
  packPrice: number;
  quantity: number;
  subtotal: number;
  photosCount: number;
  student_id: string;
  classId: string;
  selectedClassPhotoId?: string;
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
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      redirect("/backoffice/login");
    }

    // 2. Connect to database
    await connectDB();

    // 3. Fetch all schools
    const schools = await School.find({}).sort({ createdAt: -1 }).lean();

    // 4. Get statistics for each school
    const schoolsWithStats: SchoolWithStats[] = await Promise.all(
      schools.map(async (school) => {
        // Use ObjectId for queries
        const schoolId = school._id;

        // Count students
        const studentsCount = await Student.countDocuments({ schoolId });

        // Get orders
        const orders = await Order.find({ schoolId })
          .select("totalAmount status studentIds")
          .lean();

        // Calculate order statistics
        const ordersCount = orders.length;
        const pendingOrders = orders.filter(
          (o) => o.status === "pending"
        ).length;
        const paidOrders = orders.filter((o) => o.status === "paid").length;

        // Calculate unique students with orders
        const studentsWithOrders = new Set();
        orders.forEach((order) => {
          if (order.studentIds && Array.isArray(order.studentIds)) {
            order.studentIds.forEach((id) => studentsWithOrders.add(id.toString()));
          }
        });
        const studentsWithOrdersCount = studentsWithOrders.size;

        // Calculate revenue
        const totalRevenue = orders.reduce((sum, order) => {
          const amount = order.totalAmount ?? 0;
          // Debug log for missing totalAmount
          if (!order.totalAmount && order.totalAmount !== 0) {
            console.log(`Order without totalAmount:`, order);
          }
          return sum + amount;
        }, 0);

        const paidRevenue = orders
          .filter((o) => o.status === "paid")
          .reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
        const schoolPayment = paidRevenue * 0.3;

        return {
          _id: schoolId.toString(),
          name: school.name,
          loginCode: school.loginCode,
          createdAt: school.createdAt
            ? new Date(school.createdAt).toISOString()
            : new Date().toISOString(),
          studentsCount,
          ordersCount,
          totalRevenue,
          paidRevenue,
          schoolPayment,
          pendingOrders,
          paidOrders,
          studentsWithOrdersCount,
        };
      })
    );

    return {
      success: true,
      data: { schools: schoolsWithStats },
    };
  } catch (error) {
    console.error("getAllSchoolsForAdmin error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des écoles",
    };
  }
}

/**
 * Get global statistics
 * Admin only
 */
export async function getGlobalStats(): Promise<
  ActionResponse<{ stats: GlobalStats }>
> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      redirect("/backoffice/login");
    }

    // 2. Connect to database
    await connectDB();

    // 3. Get counts
    const totalSchools = await School.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 4. Get all orders for revenue calculations
    const allOrders = await Order.find({}).select("totalAmount status").lean();

    const pendingOrders = allOrders.filter((o) => o.status === "pending");
    const paidOrders = allOrders.filter((o) => o.status === "paid");

    const totalRevenue = allOrders.reduce(
      (sum, order) => sum + (order.totalAmount ?? 0),
      0
    );
    const pendingRevenue = pendingOrders.reduce(
      (sum, order) => sum + (order.totalAmount ?? 0),
      0
    );
    const paidRevenue = paidOrders.reduce(
      (sum, order) => sum + (order.totalAmount ?? 0),
      0
    );

    const stats: GlobalStats = {
      totalSchools,
      totalStudents,
      totalOrders,
      totalRevenue,
      pendingOrders: pendingOrders.length,
      paidOrders: paidOrders.length,
      pendingRevenue,
      paidRevenue,
    };

    return {
      success: true,
      data: { stats },
    };
  } catch (error) {
    console.error("getGlobalStats error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
    };
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
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      redirect("/backoffice/login");
    }

    // 2. Connect to database
    await connectDB();

    // 3. Fetch all students with school info
    const students = await Student.find({})
      .populate("schoolId", "name")
      .sort({ createdAt: -1 })
      .lean();

    // 4. Get orders for all students
    const studentIds = students.map((s) => s._id);
    const orders = await Order.find({ studentIds: { $in: studentIds } })
      .select("studentIds totalAmount status")
      .lean();

    // 5. Create a map of student orders
    const studentOrdersMap = new Map();
    orders.forEach((order) => {
      order.studentIds.forEach((studentId) => {
        const sid = studentId.toString();
        if (!studentOrdersMap.has(sid)) {
          studentOrdersMap.set(sid, {
            hasOrder: true,
            status: order.status,
            amount: order.totalAmount ?? 0,
          });
        }
      });
    });

    // 6. Build students with details
    const studentsWithDetails: StudentWithDetails[] = students.map(
      (student) => {
        const studentId = student._id.toString();
        const orderInfo = studentOrdersMap.get(studentId);

        // Find first available photo for display
        const firstPhoto = student.photos?.[0];
        const thumbnailUrl = student.thumbnail?.cloudFrontUrl || firstPhoto?.cloudFrontUrl || null;

        return {
          _id: studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          loginCode: student.loginCode,
          clearPassword: student.clearPassword,
          hasLoggedIn: student.hasLoggedIn,
          classId: student.classId,
          schoolName:
            (student.schoolId as unknown as PopulatedSchool | null)?.name ||
            "N/A",
          schoolId:
            (
              student.schoolId as unknown as PopulatedSchool | null
            )?._id?.toString() || "",
          photoUrl: thumbnailUrl,
          hasOrder: orderInfo?.hasOrder || false,
          orderStatus: orderInfo?.status || null,
          orderAmount: orderInfo?.amount || null,
          createdAt: student.createdAt
            ? new Date(student.createdAt).toISOString()
            : new Date().toISOString(),
        };
      }
    );

    return {
      success: true,
      data: { students: studentsWithDetails },
    };
  } catch (error) {
    console.error("getAllStudentsForAdmin error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des étudiants",
    };
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
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      redirect("/backoffice/login");
    }

    // 2. Connect to database
    await connectDB();

    // 3. Fetch all orders with school and student info
    const orders = await Order.find({})
      .populate("schoolId", "name")
      .populate("studentIds", "firstName lastName thumbnail photos")
      .sort({ createdAt: -1 })
      .lean();

    // 4. Build orders with details
    const ordersWithDetails: OrderWithDetails[] = orders.map((order) => {
      // Get student names
      const studentNames = Array.isArray(order.studentIds)
        ? (order.studentIds as unknown as PopulatedStudent[])
            .filter(
              (student) => student && student.firstName && student.lastName
            )
            .map((student) => `${student.firstName} ${student.lastName}`)
        : [];

      // Get student photos
      const studentPhotos = Array.isArray(order.studentIds)
        ? (order.studentIds as unknown as PopulatedStudent[])
            .filter(
              (student) => student && student.firstName && student.lastName
            )
            .map(
              (student) =>
                student.thumbnail?.cloudFrontUrl ||
                student.photos?.[0]?.cloudFrontUrl ||
                null
            )
        : [];

      return {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        schoolName:
          (order.schoolId as unknown as PopulatedSchool | null)?.name || "N/A",
        schoolId:
          (
            order.schoolId as unknown as PopulatedSchool | null
          )?._id?.toString() || "",
        studentNames: studentNames.length > 0 ? studentNames : ["N/A"],
        studentPhotos,
        totalAmount: order.totalAmount ?? 0,
        paymentMethod: order.paymentMethod,
        status: order.status,
        itemsCount: order.items?.length || 0,
        packsCount: order.packs?.length || 0,
        notes: order.notes || null,
        createdAt: order.createdAt
          ? new Date(order.createdAt).toISOString()
          : new Date().toISOString(),
        paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : null,
        itemTypes: [
          ...new Set([
            ...(order.items?.map((i: OrderItem) => i.plancheName) || []),
            ...(order.items?.map((i: OrderItem) => i.format) || []),
            ...(order.packs?.length ? ["pack"] : []),
          ]),
        ],
        items: (order.items || []).map((item: OrderItem & { _id?: Types.ObjectId }) => ({
          ...item,
          _id: item._id ? item._id.toString() : undefined,
        })) as OrderItemDetails[],
        packs: (order.packs || []).map((pack: OrderPackItem & { _id?: Types.ObjectId }) => ({
          ...pack,
          _id: pack._id ? pack._id.toString() : undefined,
        })) as OrderPackDetails[],
      };
    });

    return {
      success: true,
      data: { orders: ordersWithDetails },
    };
  } catch (error) {
    console.error("getAllOrdersForAdmin error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des commandes",
    };
  }
}

/**
 * Get detailed school information
 * Admin only
 */
export async function getSchoolDetailsForAdmin(schoolId: string): Promise<
  ActionResponse<{
    school: SchoolWithStats & {
      email: string;
      address: string;
      phone: string;
      closingDate?: string;
      password?: string;
      clearPassword?: string;
    };
    students: StudentWithDetails[];
    orders: OrderWithDetails[];
  }>
> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      redirect("/backoffice/login");
    }

    // 2. Connect to database
    await connectDB();

    // 3. Fetch school
    // 3. Fetch school
    const school = await School.findById(schoolId).lean();
    if (!school) {
      return { success: false, error: "École non trouvée" };
    }

    // 4. Fetch students
    const students = await Student.find({ schoolId })
      .populate("schoolId", "name")
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    // 5. Fetch orders
    const orders = await Order.find({ schoolId })
      .populate("schoolId", "name")
      .populate("studentIds", "firstName lastName thumbnail photos")
      .sort({ createdAt: -1 })
      .lean();

    // 6. Calculate stats
    const studentsCount = students.length;
    const ordersCount = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const paidOrders = orders.filter((o) => o.status === "paid").length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount ?? 0),
      0
    );
    const paidRevenue = orders
      .filter((o) => o.status === "paid")
      .reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    const schoolPayment = paidRevenue * 0.3;

    // Calculate unique students with orders
    const studentsWithOrders = new Set();
    orders.forEach((order) => {
      if (order.studentIds && Array.isArray(order.studentIds)) {
        order.studentIds.forEach((id) => studentsWithOrders.add(id.toString()));
      }
    });
    const studentsWithOrdersCount = studentsWithOrders.size;

    // 7. Format students
    const studentIds = students.map((s) => s._id);
    const studentOrders = await Order.find({ studentIds: { $in: studentIds } })
      .select("studentIds totalAmount status")
      .lean();

    const studentOrdersMap = new Map();
    studentOrders.forEach((order) => {
      order.studentIds.forEach((sid) => {
        const id = sid.toString();
        if (!studentOrdersMap.has(id)) {
          studentOrdersMap.set(id, {
            hasOrder: true,
            status: order.status,
            amount: order.totalAmount ?? 0,
          });
        }
      });
    });

    const studentsWithDetails: StudentWithDetails[] = students.map((student) => {
      const id = student._id.toString();
      const orderInfo = studentOrdersMap.get(id);
      const firstPhoto = student.photos?.[0];
      const thumbnailUrl = student.thumbnail?.cloudFrontUrl || firstPhoto?.cloudFrontUrl || null;

      return {
        _id: id,
        firstName: student.firstName,
        lastName: student.lastName,
        loginCode: student.loginCode,
        clearPassword: student.clearPassword,
        hasLoggedIn: student.hasLoggedIn,
        classId: student.classId,
        schoolName: school.name,
        schoolId: school._id.toString(),
        photoUrl: thumbnailUrl,
        hasOrder: orderInfo?.hasOrder || false,
        orderStatus: orderInfo?.status || null,
        orderAmount: orderInfo?.amount || null,
        createdAt: student.createdAt
          ? new Date(student.createdAt).toISOString()
          : new Date().toISOString(),
      };
    });

    // 8. Format orders
    const ordersWithDetails: OrderWithDetails[] = orders.map((order) => {
      const studentNames = Array.isArray(order.studentIds)
        ? (order.studentIds as unknown as PopulatedStudent[])
            .filter(
              (student) => student && student.firstName && student.lastName
            )
            .map((student) => `${student.firstName} ${student.lastName}`)
        : [];

      // Get student photos
      const studentPhotos = Array.isArray(order.studentIds)
        ? (order.studentIds as unknown as PopulatedStudent[])
            .filter(
              (student) => student && student.firstName && student.lastName
            )
            .map(
              (student) =>
                student.thumbnail?.cloudFrontUrl ||
                student.photos?.[0]?.cloudFrontUrl ||
                null
            )
        : [];

      return {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        schoolName: school.name,
        schoolId: school._id.toString(),
        studentNames: studentNames.length > 0 ? studentNames : ["N/A"],
        studentPhotos,
        totalAmount: order.totalAmount ?? 0,
        paymentMethod: order.paymentMethod,
        status: order.status,
        itemsCount: order.items?.length || 0,
        packsCount: order.packs?.length || 0,
        notes: order.notes || null,
        createdAt: order.createdAt
          ? new Date(order.createdAt).toISOString()
          : new Date().toISOString(),
        paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : null,
        itemTypes: [
          ...new Set([
            ...(order.items?.map((i: OrderItem) => i.plancheName) || []),
            ...(order.items?.map((i: OrderItem) => i.format) || []),
            ...(order.packs?.length ? ["pack"] : []),
          ]),
        ],
        items: (order.items || []).map((item: OrderItem & { _id?: Types.ObjectId }) => ({
          ...item,
          _id: item._id ? item._id.toString() : undefined,
        })) as OrderItemDetails[],
        packs: (order.packs || []).map((pack: OrderPackItem & { _id?: Types.ObjectId }) => ({
          ...pack,
          _id: pack._id ? pack._id.toString() : undefined,
        })) as OrderPackDetails[],
      };
    });

    return {
      success: true,
      data: {
        school: {
          _id: school._id.toString(),
          name: school.name,
          loginCode: school.loginCode,
          email: school.email,
          address: school.address,
          phone: school.phone,
          password: school.password,
          clearPassword: school.clearPassword,
          closingDate: school.closingDate
            ? new Date(school.closingDate).toISOString()
            : undefined,
          createdAt: school.createdAt
            ? new Date(school.createdAt).toISOString()
            : new Date().toISOString(),
          studentsCount,
          ordersCount,
          totalRevenue,
          paidRevenue,
          schoolPayment,
          pendingOrders,
          paidOrders,
          studentsWithOrdersCount,
        },
        students: studentsWithDetails,
        orders: ordersWithDetails,
      },
    };
  } catch (error) {
    console.error("getSchoolDetailsForAdmin error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des détails de l'école",
    };
  }
}

/**
 * Update school closing date
 * Admin only
 */
export async function updateSchoolClosingDate(
  schoolId: string,
  closingDate: Date | null
): Promise<ActionResponse<void>> {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      redirect("/backoffice/login");
    }

    // 2. Connect to database
    await connectDB();

    // 3. Update school
    await School.findByIdAndUpdate(schoolId, {
      $set: { closingDate },
    });

    return { success: true };
  } catch (error) {
    console.error("updateSchoolClosingDate error:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la date de clôture",
    };
  }
}

/**
 * Update school RIB (Admin)
 */
export async function updateSchoolRibForAdmin(
  schoolId: string,
  rib: string
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    await connectDB();

    // Vérifier l'authentification admin
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    await School.findByIdAndUpdate(schoolId, {
      $set: { rib },
    });

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("updateSchoolRibForAdmin error:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du RIB",
    };
  }
}

/**
 * Update school details (Admin)
 */
export async function updateSchoolDetails(
  schoolId: string,
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    closingDate?: Date | null;
    rib?: string;
  }
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    await connectDB();

    // Vérifier l'authentification admin
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    await School.findByIdAndUpdate(schoolId, {
      $set: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        closingDate: data.closingDate,
        rib: data.rib,
      },
    });

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("updateSchoolDetails error:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des informations",
    };
  }
}
