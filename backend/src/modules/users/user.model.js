import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../../utils/bcrypt.util.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },

    // Thông tin xác thực
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    // Vai trò người dùng
    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYER", "JOB_SEEKER"],
      default: "JOB_SEEKER",
    },

    // Thông tin bổ sung
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false }, // Dùng cho Employer: Admin duyệt mới được đăng tin
    language: { type: String, enum: ["EN", "VI"], default: "VI" },

    credits: { type: Number, default: 14000, min: 0 },

    // Thông tin cho Job Seeker
    resume: { type: String }, // Deprecated: dùng cvs array thay thế
    cvs: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        fileSize: { type: Number },
        analysis: { type: mongoose.Schema.Types.Mixed }, // Lưu kết quả phân tích AI
      }
    ],
    skills: [{ type: String }],
    experience: { type: String },
    education: { type: String },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],

    // Thông tin cho Employer
    companyName: { type: String },
    companyDescription: { type: String },
    companyWebsite: { type: String },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// So sánh mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

export const UserModel = mongoose.model("User", userSchema);






