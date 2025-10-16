import { Types } from 'mongoose'

// ============================================
// USER ROLES
// ============================================
export type UserRole = 'parent' | 'school'

// ============================================
// PHOTO TYPES
// ============================================
export type PhotoFormat = '10x15' | '13x18' | 'identite'

export interface Photo {
  s3Key: string
  cloudFrontUrl: string
  format: PhotoFormat
  price: number
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
// CART TYPES (Client-side state)
// ============================================
export interface CartItem {
  photoUrl: string
  format: PhotoFormat
  quantity: number
  unitPrice: number
}

export interface Cart {
  items: CartItem[]
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
