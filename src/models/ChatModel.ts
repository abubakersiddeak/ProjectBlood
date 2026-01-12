import mongoose, { Schema, Model } from "mongoose";
import { IChat } from "@/types/modelTyps";

// --- Chat (Conversation) Schema ---
const chatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

// --- Export Models ---
export const ChatModel: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
