import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    outcome: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending"],
      default: "approved", // Approved immediately for local use
    },
  },
  {
    timestamps: true,
    collection: "blogs",
  }
);

export default mongoose.model("Blog", BlogSchema);
