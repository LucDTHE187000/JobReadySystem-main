import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // Base64 string of the poster image
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    applicants: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["running", "paused", "ended"],
      default: "running",
    },
  },
  {
    timestamps: true,
    collection: "campaigns",
  }
);

export default mongoose.model("Campaign", CampaignSchema);
