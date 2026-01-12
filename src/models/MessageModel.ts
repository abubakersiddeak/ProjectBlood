import mongoose, { Schema, Model } from "mongoose";
import { IMessage } from "@/types/modelTyps";

// --- Message Schema ---
const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    image: { type: String }, // ছবি পাঠানোর জন্য (যেমন: প্রেসক্রিপশন)
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// --- Export Models ---

export const MessageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
