import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "audio"],
      default: "text",
    },
    text: { type: String, trim: true },
    mediaUrl: { type: String },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ chatId: 1, createdAt: -1 });

export const MessageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
