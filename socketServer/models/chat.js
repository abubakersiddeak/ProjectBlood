import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    unreadCount: { type: Map, of: Number, default: {} },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

chatSchema.index({ participants: 1 });

export const ChatModel =
  mongoose.models.Chat || mongoose.model("Chat", chatSchema);
