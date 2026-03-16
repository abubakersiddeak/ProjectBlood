import mongoose, { Schema, Model } from "mongoose";
import { IDonationRecord } from "@/types/modelTyps";

const donationRecordSchema = new Schema<IDonationRecord>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "BloodDonationRequest",
      required: true,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodGroup: { type: String, required: true },
    donationDate: { type: Date, default: Date.now },
    hospitalName: { type: String, required: true },
    unitsDonated: { type: Number, default: 1 },

    rating: { type: Number, min: 1, max: 5, default: 5 },
    reviewMessage: { type: String, maxlength: 300 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ✅ Compound Index - দ্রুত কুয়েরির জন্য
donationRecordSchema.index({ donorId: 1, donationDate: -1 });

// ✅ Post Hook - User এর donationCount আপডেট করুন
donationRecordSchema.post("save", async function () {
  try {
    const UserModel = mongoose.model("User");

    await UserModel.findByIdAndUpdate(this.donorId, {
      $inc: { donationCount: 1 },
      lastDonationDate: this.donationDate,
    });
  } catch (error) {
    console.error("Error updating user donation count:", error);
  }
});

const DonationRecordModel: Model<IDonationRecord> =
  mongoose.models.DonationRecord ||
  mongoose.model<IDonationRecord>("DonationRecord", donationRecordSchema);

export default DonationRecordModel;
