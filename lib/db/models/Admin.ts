import mongoose, { Model, Schema } from 'mongoose'
import { IAdmin } from '@/types'

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development (Next.js hot reload)
const Admin: Model<IAdmin> =
  (mongoose.models?.Admin as Model<IAdmin>) ||
  mongoose.model<IAdmin>('Admin', AdminSchema)

export default Admin
