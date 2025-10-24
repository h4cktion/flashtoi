import { Types } from 'mongoose'

// ============================================
// USER ROLES
// ============================================
export type UserRole = 'parent' | 'school'

// ============================================
// PHOTO TYPES
// ============================================
export type PhotoFormat = '10x15' | '13x18' | 'identite'
export type PhotoPlanche = 'classe' | 'planche1' | 'planche2' | 'planche4' | 'mixte' | 'rotation'

export interface Photo {
  s3Key: string
  cloudFrontUrl: string
  format: PhotoFormat
  price: number
  planche: PhotoPlanche
}

// ============================================
// STUDENT TYPES
// ============================================
export interface Sibling {
  studentId: Types.ObjectId | string
  firstName: string
}

export interface IStudent {
  _id: Types.ObjectId | string
  firstName: string
  lastName: string
  qrCode: string
  loginCode: string
  password: string
  schoolId: Types.ObjectId | string
  classId: string
  photos: Photo[]
  siblings: Sibling[]
  createdAt: Date
  updatedAt: Date
}

// ============================================
// SCHOOL TYPES
// ============================================
export interface ISchool {
  _id: Types.ObjectId | string
  name: string
  email: string
  loginCode: string
  password: string
  address: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// ORDER TYPES
// ============================================
export type PaymentMethod = 'online' | 'check' | 'cash' | 'pending'
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'validated'
  | 'processing'
  | 'shipped'
  | 'completed'

export interface OrderItem {
  photoUrl: string
  format: PhotoFormat
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface IOrder {
  _id: Types.ObjectId | string
  orderNumber: string
  studentIds: (Types.ObjectId | string)[]
  schoolId: Types.ObjectId | string
  items: OrderItem[]
  totalAmount: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  paidAt?: Date
  validatedBy?: Types.ObjectId | string
  validatedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// AUTH TYPES (NextAuth extensions)
// ============================================
export interface SessionUser {
  id: string
  role: UserRole
  name?: string
  email?: string
  schoolId?: string
  studentId?: string
}

// ============================================
// SERVER ACTION RESPONSE TYPES
// ============================================
export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// PACK TYPES
// ============================================
export type PackName = 'S' | 'M' | 'L' | 'XL' | 'XXL'

export interface IPack {
  _id: Types.ObjectId | string
  name: PackName
  price: number
  description: string
  planches: PhotoPlanche[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Pack {
  pack: IPack
  photos: Photo[]
}

// ============================================
// CART TYPES (Client-side state)
// ============================================
export interface CartItem {
  photoUrl: string
  format: PhotoFormat
  quantity: number
  unitPrice: number
}

export interface PackCartItem {
  packId: string
  packName: PackName
  packPrice: number
  photos: Photo[]
  quantity: number
}

export interface Cart {
  items: CartItem[]
  packs: PackCartItem[]
  totalItems: number
  totalAmount: number
}

// ============================================
// ORDER FILTERS (for school dashboard)
// ============================================
export interface OrderFilters {
  status?: OrderStatus
  paymentMethod?: PaymentMethod
  dateFrom?: Date
  dateTo?: Date
  studentName?: string
}
