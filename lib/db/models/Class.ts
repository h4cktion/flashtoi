import mongoose, { Model, Schema, Types } from "mongoose";

export interface IClassPhoto {
  s3Key: string;
  cloudFrontUrl: string;
  filename: string;
  uploadedAt: Date;
}

export interface IClass {
  _id: Types.ObjectId | string;
  school_name: string;
  class_name: string;
  schoolId: Types.ObjectId | string;
  photos: IClassPhoto[];
}

const ClassSchema = new Schema<IClass>(
  {
    school_name: {
      type: String,
      required: true,
    },
    class_name: {
      type: String,
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId, // Assuming generic ObjectId reference, not strict ref to School model to avoid circular deps unless needed
      required: true,
      ref: "School",
    },
    photos: [
      {
        s3Key: { type: String, required: true },
        cloudFrontUrl: { type: String, required: true },
        filename: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: false, // User didn't specify timestamps for the class doc itself, but usually good. User schema didn't show createdAt/updatedAt.
    collection: "classes", // Explicitly matching user's collection name
  }
);

// Indexes for efficient lookup
ClassSchema.index({ schoolId: 1, class_name: 1 });

const Class: Model<IClass> =
  (mongoose.models?.Class as Model<IClass>) ||
  mongoose.model<IClass>("Class", ClassSchema);

export default Class;
