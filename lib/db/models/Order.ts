import mongoose, { Model, Schema } from "mongoose";
import { IOrder } from "@/types";
import { PLANCHE_NAMES } from "@/constants/constants";

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    studentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    ],
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: [true, "School ID is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    items: [
      {
        photoUrl: {
          type: String,
          required: true,
        },
        format: {
          type: String,
          enum: PLANCHE_NAMES,
          required: true,
        },
        plancheName: {
          type: String,
          enum: PLANCHE_NAMES,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
        student_id: {
          type: String,
          required: false,
        },
        classId: {
          type: String,
          required: false,
        },
      },
    ],
    packs: [
      {
        packId: {
          type: String,
          required: true,
        },
        packName: {
          type: String,
          enum: ["S", "M", "L", "XL", "XXL"],
          required: true,
        },
        packPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
        photosCount: {
          type: Number,
          required: true,
          min: 1,
        },
        student_id: {
          type: String,
          required: false,
        },
        classId: {
          type: String,
          required: false,
        },
        selectedClassPhotoId: {
          type: String,
          required: false,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["online", "check", "cash", "pending"],
      default: "pending",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "validated",
        "processing",
        "shipped",
        "completed",
      ],
      default: "pending",
      required: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    validatedBy: {
      type: Schema.Types.ObjectId,
      ref: "School",
    },
    validatedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
OrderSchema.index({ schoolId: 1, status: 1 });
OrderSchema.index({ schoolId: 1, createdAt: -1 });
OrderSchema.index({ studentIds: 1, createdAt: -1 });

// Prevent model recompilation in development (Next.js hot reload)
const Order: Model<IOrder> =
  (mongoose.models?.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
