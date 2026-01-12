import mongoose, { Schema, Model } from "mongoose";
import { IBloodDonationRequest } from "@/types/modelTyps";

const bloodDonationRequestSchema = new Schema<IBloodDonationRequest>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester ID is required"],
    },
    recipientName: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      index: true, // সার্চ অপ্টিমাইজেশনের জন্য
    },
    totalUnitsNeeded: {
      type: Number,
      default: 1,
      min: [1, "At least 1 unit is required"],
    },
    unitsFulfilled: {
      type: Number,
      default: 0,
    },
    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    // GeoJSON Location for Map and Radius Search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Coordinates are required"],
      },
      address: {
        type: String,
        required: [true, "Full address is required"],
      },
      city: String,
    },
    donationDate: {
      type: Date,
      required: [true, "Donation date is required"],
    },
    donationTime: {
      type: String,
      required: [true, "Donation time is required"],
    },
    recipientPhone: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    urgency: {
      type: String,
      enum: ["Normal", "Urgent", "Emergency"],
      default: "Normal",
    },
    donationStatus: {
      type: String,
      enum: ["pending", "in-progress", "success", "cancel"],
      default: "pending",
      index: true,
    },
    // ডোনারদের রেসপন্স ট্র্যাক করার জন্য
    potentialDonors: [
      {
        donorId: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["interested", "confirmed", "declined"],
          default: "interested",
        },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    additionalMessage: {
      type: String,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Geospatial Index (ম্যাপে সার্চ করার জন্য সবচেয়ে গুরুত্বপূর্ণ) ---
bloodDonationRequestSchema.index({ location: "2dsphere" });

// --- Export Model ---
const BloodDonationReqModel: Model<IBloodDonationRequest> =
  mongoose.models.BloodDonationRequest ||
  mongoose.model<IBloodDonationRequest>(
    "BloodDonationRequest",
    bloodDonationRequestSchema
  );

export default BloodDonationReqModel;
