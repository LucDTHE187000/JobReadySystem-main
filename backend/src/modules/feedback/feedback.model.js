import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Bug", "Góp ý", "Đánh giá"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "reviewed"],
      default: "new",
    },
  },
  {
    timestamps: true,
    collection: "feedbacks",
  }
);

export default mongoose.model("Feedback", FeedbackSchema);
