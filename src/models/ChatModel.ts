import mongoose, { Schema, Model } from "mongoose";
import { IChat } from "@/types/modelTyps";

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    isGroup: {
      type: Boolean,
      default: false,
    },

    groupName: {
      type: String,
    },

    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Prevent duplicate one-to-one chat
chatSchema.index({ participants: 1 });

export const ChatModel: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
