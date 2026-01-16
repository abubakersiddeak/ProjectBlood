import { IDonationModel, IUserModel } from "@/types/modelTyps";
import mongoose, { Schema, Model } from "mongoose";

// --- Donation Sub-document Schema ---
const donationSchema = new Schema<IDonationModel>(
  {
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true },

    // হসপিটালের বিস্তারিত তথ্য
    hospital: {
      name: { type: String, required: true },
      address: { type: String }, // মানুষের পড়ার জন্য ঠিকানা
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },

    note: { type: String },
  },
  { _id: true }
);

// --- Main User Schema ---
const userSchema = new Schema<IUserModel>(
  {
    userId: { type: Number, unique: true }, // ৮ ডিজিটের অটো-ইনক্রিমেন্ট আইডি
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // ডাটাবেজ থেকে ডাটা কুয়েরি করার সময় পাসওয়ার্ড আসবে না
    },
    role: {
      type: String,
      enum: ["user", "admin", "volunteer"],
      default: "user",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dmb58pab9/image/upload/v1765099270/vecteezy_man-empty-avatar-vector-photo-placeholder-for-social_36594092_ctngem.webp",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
      index: true, // সার্চ ফাস্ট করার জন্য ইনডেক্স
    },
    donationHistory: [donationSchema],

    // GeoJSON Standard Location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        district: String,
        upazila: String,
      },
    },

    // Futuristic Fields
    phone: { type: String }, // Number এর বদলে String (০ অক্ষুণ্ণ রাখতে)
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    isAvailable: { type: Boolean, default: true },
    bio: { type: String, maxlength: 200 },
    blogCount: { type: Number, default: 0 },
    pushToken: { type: String }, // Real-time Notification এর জন্য
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followerCount: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

// --- Indexes ---
// নিকটস্থ ডোনার দ্রুত খুঁজে বের করার জন্য (Spatial Query)
userSchema.index({ location: "2dsphere" });

// --- Auto-increment Logic (8-digit ID) ---
userSchema.pre("save", async function () {
  if (this.isNew) {
    try {
      const lastUser = await mongoose.model("User").findOne().sort("-userId");

      if (lastUser && lastUser.userId) {
        this.userId = lastUser.userId + 1;
      } else {
        this.userId = 10000001; // প্রথম আইডি
      }
    } catch (error: unknown) {
      throw error; // এরর থ্রো করলে মুঙ্গুস নিজে থেকেই হ্যান্ডেল করবে
    }
  }
});

// --- Export Model ---
const UserModel: Model<IUserModel> =
  mongoose.models.User || mongoose.model<IUserModel>("User", userSchema);

export default UserModel;
