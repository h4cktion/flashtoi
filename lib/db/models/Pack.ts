import mongoose, { Model, Schema } from 'mongoose'

export type PackName = 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type PhotoPlanche = 'classe' | 'planche1' | 'planche2' | 'planche4' | 'mixte' | 'rotation'

export interface IPack {
  _id: mongoose.Types.ObjectId | string
  name: PackName
  price: number
  description: string
  planches: PhotoPlanche[]
  order: number
  createdAt: Date
  updatedAt: Date
}

const PackSchema = new Schema<IPack>(
  {
    name: {
      type: String,
      required: [true, 'Pack name is required'],
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    planches: {
      type: [String],
      required: [true, 'Planches are required'],
      enum: ['classe', 'planche1', 'planche2', 'planche4', 'mixte', 'rotation'],
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0
        },
        message: 'At least one planche is required',
      },
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      min: 1,
    },
  },
  {
    timestamps: true,
  }
)

// Index pour récupérer les packs dans l'ordre
PackSchema.index({ order: 1 })

// Prevent model recompilation in development (Next.js hot reload)
const Pack: Model<IPack> =
  (mongoose.models?.Pack as Model<IPack>) ||
  mongoose.model<IPack>('Pack', PackSchema)

export default Pack
