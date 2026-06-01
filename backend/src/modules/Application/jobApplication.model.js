import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobseekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "interview", "accepted", "rejected"],
      default: "pending",
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    resumeUrl: String,

    coverLetter: {
      type: String,
      default: "",
    },

    coverLetter: { type: String, default: '' },

  },
  {
    timestamps: true,
    collection: "job_applications",
  }
);

// Index tối ưu
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ jobseekerId: 1 });

// Ngăn apply trùng
applicationSchema.index(
  { jobId: 1, jobseekerId: 1 },
  { unique: true }
);

export default mongoose.model("JobApplication", applicationSchema);
