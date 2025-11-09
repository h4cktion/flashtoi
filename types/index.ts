import { Types } from "mongoose";
import type { PhotoFormat, PlancheName } from "@/constants/constants";

// ============================================
// USER ROLES
// ============================================
export type UserRole = "parent" | "school" | "admin";

// ============================================
// PHOTO TYPES
// ============================================
export type { PhotoFormat };
export type PhotoPlanche = PlancheName;

export interface Photo {
  s3Key: string;
  cloudFrontUrl: string;
  format: PhotoFormat;
  price: number;
  planche: PhotoPlanche;
}

// ============================================
// STUDENT TYPES
// ============================================
export interface Sibling {
  studentId: Types.ObjectId | string;
  firstName: string;
}

export interface IStudent {
  _id: Types.ObjectId | string;
  student_id?: string;
  firstName: string;
  lastName: string;
  qrCode: string;
  loginCode: string;
  password: string;
  schoolId: Types.ObjectId | string;
  classId: string;
  photos: Photo[];
  thumbnail?: {
    s3Key: string;
    cloudFrontUrl: string;
  };
  siblings: Sibling[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SCHOOL TYPES
// ============================================
export interface ISchool {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  loginCode: string;
  password: string;
  address: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ADMIN TYPES
// ============================================
export interface IAdmin {
  _id: Types.ObjectId | string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ORDER TYPES
// ============================================
export type PaymentMethod = "online" | "check" | "cash" | "pending";
export type OrderStatus =
  | "pending"
  | "paid"
  | "validated"
  | "processing"
  | "shipped"
  | "completed";

export interface OrderItem {
  photoUrl: string;
  format: PhotoPlanche;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  student_id: string;
  classId: string;
}

export interface OrderPackItem {
  packId: string;
  packName: PackName;
  packPrice: number;
  quantity: number;
  subtotal: number;
  photosCount: number;
  student_id: string;
  classId: string;
}

export interface IOrder {
  _id: Types.ObjectId | string;
  orderNumber: string;
  studentIds: (Types.ObjectId | string)[];
  schoolId: Types.ObjectId | string;
  email: string;
  items: OrderItem[];
  packs?: OrderPackItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paidAt?: Date;
  validatedBy?: Types.ObjectId | string;
  validatedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AUTH TYPES (NextAuth extensions)
// ============================================
export interface SessionUser {
  id: string;
  role: UserRole;
  name?: string;
  email?: string;
  schoolId?: string;
  studentId?: string;
}

// ============================================
// SERVER ACTION RESPONSE TYPES
// ============================================
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// PACK TYPES
// ============================================
export type PackName = "S" | "M" | "L" | "XL" | "XXL";

export interface IPack {
  _id: Types.ObjectId | string;
  name: PackName;
  price: number;
  description: string;
  planches: PhotoPlanche[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pack {
  pack: IPack;
  photos: Photo[];
}

// ============================================
// CART TYPES (Client-side state)
// ============================================
export interface CartItem {
  photoUrl: string;
  format: PhotoPlanche;
  quantity: number;
  unitPrice: number;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
}

export interface PackCartItem {
  packId: string;
  packName: PackName;
  packPrice: number;
  photos: Photo[];
  quantity: number;
  studentId: string;
  studentName: string;
  student_id: string;
  classId: string;
}

export interface Cart {
  items: CartItem[];
  packs: PackCartItem[];
  totalItems: number;
  totalAmount: number;
}

// ============================================
// TEMPLATE TYPES (for dynamic planche generation)
// ============================================
export interface ITemplatePhoto {
  x: number;
  y: number;
  width: number;
  rotation: number;
  cropTop: number;
  cropBottom: number;
  effect?: string;
  mug?: {
    radius: number;
    thickness: number;
    color: string;
  };
  feather?: {
    intensity: number;
    irregularity: number;
  };
  css?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    cropTop?: number;
    cropBottom?: number;
  };
}

export interface ITemplate {
  _id: Types.ObjectId | string;
  planche: string;
  format: string;
  background: string;
  backgroundS3Url?: string;
  price: number;
  order: number;
  rotationWeb?: boolean;
  photos: ITemplatePhoto[];
  photoWeb?: {
    planche: string;
    photos: ITemplatePhoto[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ORDER FILTERS (for school dashboard)
// ============================================
export interface OrderFilters {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
  studentName?: string;
}
