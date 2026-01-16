import mongoose, { Document, Types } from "mongoose";
export interface IDonationModel {
  receiver: mongoose.Types.ObjectId;
  date: Date;
  hospital?: string;
  note?: string;
}
//  location Interface   (GeoJSON Standard)
export interface IUserLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
}
// --- UserModel Interface ---
export interface IUserModel extends Document {
  userId: number;
  fullName: string;
  email: string;
  password?: string;
  role: "user" | "admin" | "volunteer";
  avatar: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  donationHistory: IDonationModel[];
  location: {
    type: "Point";
    coordinates: [number, number];
    address: {
      district: string;
      upazila: string;
    };
  };
  phone?: string;
  status: "active" | "inactive" | "blocked";
  // Futuristic fields (যেগুলো নিয়ে এরর আসছিল)
  isAvailable: boolean;
  bio?: string;
  blogCount: number;
  followers: mongoose.Types.ObjectId[]; // কারা আমাকে ফলো করছে
  following: mongoose.Types.ObjectId[]; // আমি কাদের ফলো করছি
  followerCount: number; // দ্রুত দেখানোর জন্য (Optional কিন্তু ভালো)
  pushToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
// --- FundModel Interface ---
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

// --- IBloodDonationRequestModel Interface ---
export interface IPotentialDonor {
  donorId: Types.ObjectId;
  status: "interested" | "confirmed" | "declined";
  appliedAt: Date;
}

export interface IBloodDonationRequest extends Document {
  requesterId: Types.ObjectId;
  recipientName: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  totalUnitsNeeded: number;
  unitsFulfilled: number;
  hospitalName: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    city?: string;
  };
  donationDate: Date;
  donationTime: string;
  recipientPhone: string;
  urgency: "Normal" | "Urgent" | "Emergency";
  donationStatus: "pending" | "in-progress" | "success" | "cancel";
  potentialDonors: IPotentialDonor[];
  additionalMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- BlogModel Interface ---
export interface IBlog extends Document {
  authorId: mongoose.Types.ObjectId; // যে ব্লগটি লিখেছে (User Model Reference)
  title: string;
  slug: string; // URL-friendly title
  content: string; // ব্লগের মূল লিখা
  bannerImage?: string; // ব্লগের কভার ফটো
  tags: string[]; // ["BloodDonation", "HealthTips", "Emergency"]
  likes: mongoose.Types.ObjectId[]; // কতজন ইউজার লাইক দিয়েছে
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// --- ChatModel Interface ---
export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[]; // [Sender, Receiver]
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// --- MessageModel Interface ---
export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  image?: string;
  isRead: boolean;
  createdAt: Date;
}
// --- NotificationModel Interface ---
export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId; // কাকে পাঠানো হচ্ছে
  senderId?: mongoose.Types.ObjectId; // কে পাঠিয়েছে (অপশনাল)
  type:
    | "BLOOD_REQUEST"
    | "CHAT_MESSAGE"
    | "FOLLOW"
    | "DONATION_CONFIRMED"
    | "SYSTEM_ALERT";
  title: string;
  message: string;
  dataId?: mongoose.Types.ObjectId; // সংশ্লিষ্ট রিকোয়েস্ট বা চ্যাটের আইডি (লিঙ্ক করার জন্য)
  isRead: boolean;
  createdAt: Date;
}
// --- DonationRecordModel Interface ---
export interface IDonationRecord extends Document {
  requestId: mongoose.Types.ObjectId; // কোন রিকোয়েস্টের বিপরীতে রক্ত দেওয়া হয়েছে
  donorId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  bloodGroup: string;
  donationDate: Date;
  hospitalName: string;
  unitsDonated: number;

  // রিভিউ পার্ট
  rating: number; // ১ থেকে ৫ স্টার
  reviewMessage?: string;
  isVerified: boolean; // এডমিন বা সিস্টেম দ্বারা ভেরিফাইড কি না

  createdAt: Date;
}
// --- ReportModel Interface ---
export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId; // কে রিপোর্ট করেছে
  targetId: mongoose.Types.ObjectId; // কাকে বা কোন রিকোয়েস্টকে রিপোর্ট করা হয়েছে
  targetType: "User" | "BloodRequest" | "Blog";
  reason: string;
  evidenceImage?: string; // স্ক্রিনশট (Cloudinary URL)
  status: "pending" | "resolved" | "dismissed";
  adminNote?: string;
  createdAt: Date;
}
