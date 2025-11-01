import mongoose, { Model, Schema } from "mongoose";
import { ITemplate } from "@/types";

const TemplateSchema = new Schema<ITemplate>(
  {
    planche: {
      type: String,
      required: [true, "Planche name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    format: {
      type: String,
      required: [true, "Format is required"],
      trim: true,
    },
    background: {
      type: String,
      required: [true, "Background is required"],
      trim: true,
    },
    backgroundS3Url: {
      type: String,
      required: false,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
      default: 0,
    },
    rotationWeb: {
      type: Boolean,
      required: false,
    },
    photos: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        rotation: { type: Number, required: true },
        cropTop: { type: Number, required: true },
        cropBottom: { type: Number, required: true },
        effect: { type: String, required: false },
        mug: {
          radius: { type: Number, required: false },
          thickness: { type: Number, required: false },
          color: { type: String, required: false },
        },
        feather: {
          intensity: { type: Number, required: false },
          irregularity: { type: Number, required: false },
        },
      },
    ],
    photoWeb: {
      planche: { type: String, required: false },
      photos: [
        {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
          width: { type: Number, required: true },
          rotation: { type: Number, required: true },
          cropTop: { type: Number, required: true },
          cropBottom: { type: Number, required: true },
          effect: { type: String, required: false },
          mug: {
            radius: { type: Number, required: false },
            thickness: { type: Number, required: false },
            color: { type: String, required: false },
          },
          feather: {
            intensity: { type: Number, required: false },
            irregularity: { type: Number, required: false },
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour tri par ordre d'affichage
TemplateSchema.index({ order: 1 });

// Prevent model recompilation in development (Next.js hot reload)
const Template: Model<ITemplate> =
  (mongoose.models?.Template as Model<ITemplate>) ||
  mongoose.model<ITemplate>("Template", TemplateSchema);

export default Template;
