import mongoose, { Schema, Document, Model } from "mongoose";

// ১. ইন্টারফেস তৈরি (Interface for TypeScript)
export interface IFundModel extends Document {
  sessionId: string;
  paymentIntent: string;
  paymentStatus: string;
  amountTotal: number;
  currency: string;
  funderName: string;
  funderEmail: string;
  funderPhone?: string; // ঐচ্ছিক (Optional) হলে '?' ব্যবহার করা হয়
  fundFor?: string;
  message?: string;
  createdAt: Date;
}

// ২. স্কিমা ডেফিনিশন (Schema Definition)
const fundSchema = new Schema<IFundModel>({
  sessionId: { type: String, required: true, unique: true },
  paymentIntent: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  amountTotal: { type: Number, required: true },
  currency: { type: String, required: true },
  funderName: { type: String, required: true },
  funderEmail: { type: String, required: true },
  funderPhone: { type: String },
  fundFor: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ৩. মডেল এক্সপোর্ট (Model Export with HMR Support)
const FundModel: Model<IFundModel> =
  mongoose.models.Fund || mongoose.model<IFundModel>("Fund", fundSchema);

export default FundModel;
