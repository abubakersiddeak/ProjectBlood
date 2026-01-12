import mongoose, { Schema, Model } from "mongoose";
import { INotification } from "@/types/modelTyps";

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ইউজারের ইনবক্স দ্রুত লোড করার জন্য
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "BLOOD_REQUEST",
        "CHAT_MESSAGE",
        "FOLLOW",
        "DONATION_CONFIRMED",
        "SYSTEM_ALERT",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    dataId: {
      type: Schema.Types.ObjectId,
      help: "ID of the blood request or chat to navigate to",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ৩০ দিন পর পুরনো নোটিফিকেশন অটো ডিলিট করার জন্য (TTL Index)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const NotificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default NotificationModel;
