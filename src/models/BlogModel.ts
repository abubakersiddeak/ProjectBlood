import mongoose, { Schema, Model } from "mongoose";
import { IBlog } from "@/types/modelTyps";

const blogSchema = new Schema<IBlog>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
    },
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    bannerImage: {
      type: String,
      default: "https://res.cloudinary.com/default-blog-image.webp",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// টাইটেল এবং ট্যাগের ওপর ভিত্তি করে সার্চ করার জন্য টেক্সট ইনডেক্স
blogSchema.index({ title: "text", tags: "text" });

// --- Export Model ---
const BlogModel: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", blogSchema);

export default BlogModel;
