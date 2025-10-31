import mongoose, { Model, Schema } from "mongoose";
import { IStudent } from "@/types";
import { PLANCHE_NAMES, PHOTO_FORMATS } from "@/constants/constants";

const StudentSchema = new Schema<IStudent>(
  {
    student_id: {
      type: String,
      required: false,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    qrCode: {
      type: String,
      required: [true, "QR code is required"],
      unique: true,
      trim: true,
      index: true,
    },
    loginCode: {
      type: String,
      required: [true, "Login code is required"],
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [4, "Password must be at least 4 characters"],
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: [true, "School ID is required"],
      index: true,
    },
    classId: {
      type: String,
      required: [true, "Class ID is required"],
      trim: true,
    },
    photos: [
      {
        s3Key: {
          type: String,
          required: true,
        },
        cloudFrontUrl: {
          type: String,
          required: true,
        },
        format: {
          type: String,
          enum: PHOTO_FORMATS,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        planche: {
          type: String,
          enum: PLANCHE_NAMES,
          required: true,
        },
      },
    ],
    thumbnail: {
      s3Key: {
        type: String,
        required: false,
      },
      cloudFrontUrl: {
        type: String,
        required: false,
      },
    },
    siblings: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        firstName: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
StudentSchema.index({ schoolId: 1, classId: 1 });

// Prevent model recompilation in development (Next.js hot reload)
const Student: Model<IStudent> =
  (mongoose.models?.Student as Model<IStudent>) ||
  mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
