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
    externalUrl: {
      type: String,
      default: "",
    },
    sourcePlatform: {
      type: String,
      default: "JobReady",
    },

    // Tên công ty gốc khi job được tạo kiểu agency (recruiterId là người quản lý, không phải chủ job)
    agencyCompanyName: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["open", "closed", "pending"],
      default: "pending",
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
