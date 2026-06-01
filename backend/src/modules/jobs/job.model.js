import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    recruiterId: {
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
    },
    requirements: String,
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "remote", "internship"],
      default: "full-time",
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    location: {
      city: String,
      country: String,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    views: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "jobs",
  }
);

export default mongoose.model("Job", JobSchema);
