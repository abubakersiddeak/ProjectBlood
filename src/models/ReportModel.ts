import mongoose, { Schema, Model } from "mongoose";
import { IReport } from "@/types/modelTyps";

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: {
      type: String,
      enum: ["User", "BloodRequest", "Blog"],
      required: true,
    },
    reason: { type: String, required: true },
    evidenceImage: { type: String },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
    adminNote: { type: String },
  },
  { timestamps: true }
);

const ReportModel: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", reportSchema);

export default ReportModel;
