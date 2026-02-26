import mongoose, { Schema, Model } from "mongoose";
import { IMessage } from "@/types/modelTyps";

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "file", "audio"],
      default: "text",
    },

    text: {
      type: String,
      trim: true,
    },

    mediaUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Performance Index
messageSchema.index({ chatId: 1, createdAt: -1 });

export const MessageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
