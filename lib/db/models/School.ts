import mongoose, { Model, Schema } from 'mongoose'
import { ISchool } from '@/types'

const SchoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    loginCode: {
      type: String,
      required: [true, 'Login code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development (Next.js hot reload)
const School: Model<ISchool> =
  mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema)

export default School
