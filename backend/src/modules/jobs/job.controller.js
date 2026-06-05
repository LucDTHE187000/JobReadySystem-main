import mongoose from "mongoose";
import Job from "./job.model.js";
import JobApplication from "../Application/jobApplication.model.js";
import { deductCredits, CREDIT_COSTS } from "../../utils/credit.util.js";
import { UserModel } from "../users/user.model.js";

/* ========================= */
/* Tạo Job */
/* ========================= */
const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      recruiterId: req.user.userId, // lấy từ middleware
    });

    res.status(201).json({
      message: "Tạo job thành công",
      data: job,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* ========================= */
/* Apply Job */
/* ========================= */
const applyJob = async (req, res) => {
  try {
    const { jobId, resumeUrl, coverLetter } = req.body;
    const jobseekerId = req.user.userId; // 🔥 lấy từ token

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    // check job tồn tại
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 🔥 tránh apply trùng
    const existed = await JobApplication.findOne({
      jobId,
      jobseekerId,
    });

    if (existed) {
      return res.status(400).json({
        message: "Bạn đã apply job này rồi",
      });
    }

    // 🔥 Trừ credit cho việc apply job
    try {
      await deductCredits(jobseekerId, CREDIT_COSTS.JOB_APPLY, UserModel);
    } catch (creditErr) {
      return res.status(creditErr.status || 402).json({
        error: creditErr.message || 'Không đủ credit để apply job',
      });
    }

    const application = await JobApplication.create({
      jobId,
      jobseekerId,
      recruiterId: job.recruiterId,
      resumeUrl,
      coverLetter: coverLetter || '',
      status: "pending",
    });

    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 },
    });

    res.status(201).json({
      message: "Apply thành công",
      data: application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* ========================= */
/* Recruiter lấy job của mình */
/* ========================= */
const getMyJobs = async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    const jobs = await Job.find({ recruiterId })
      .sort({ isPremium: -1, createdAt: -1 })
      .lean();

    // 🔥 đếm số application realtime
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const count = await JobApplication.countDocuments({
          jobId: job._id,
        });

        return {
          ...job,
          applicationsCount: count,
        };
      })
    );

    res.status(200).json({
      message: "Lấy danh sách job thành công",
      count: jobsWithCount.length,
      data: jobsWithCount,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách job",
    });
  }
};


/* ========================= */
/* Job Detail + Applicants */
/* ========================= */
const getJobDetail = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    // Lấy job detail
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);

  } catch (error) {
    console.error("Get Job Detail Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const toggleJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.userId;

    // Check ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    // Tìm job của recruiter
    const job = await Job.findOne({
      _id: jobId,
      recruiterId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Toggle status
    job.status = job.status === "open" ? "closed" : "open";

    await job.save();

    res.status(200).json({
      message: "Job status updated successfully",
      job,
    });

  } catch (error) {
    console.error("Toggle Job Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.savedJobs.findIndex(id => id && id.toString() === jobId.toString());
    let isSaved = false;

    if (index === -1) {
      user.savedJobs.push(jobId);
      isSaved = true;
    } else {
      user.savedJobs.splice(index, 1);
    }

    await user.save();

    res.status(200).json({
      message: isSaved ? "Lưu tin tuyển dụng thành công" : "Đã hủy lưu tin tuyển dụng",
      isSaved
    });

  } catch (error) {
    console.error("Save Job Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await UserModel.findById(userId)
      .populate({
        path: "savedJobs",
        populate: { path: "recruiterId", select: "name companyName avatar avatarUrl" }
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cleanSavedJobs = (user.savedJobs || []).filter(job => job !== null);

    res.status(200).json({
      message: "Lấy danh sách việc làm đã lưu thành công",
      data: cleanSavedJobs
    });

  } catch (error) {
    console.error("Get Saved Jobs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const job = await Job.findOne({ _id: jobId, recruiterId });
    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    // Update fields
    const allowedFields = [
      "title", "description", "requirements", "jobType",
      "salary", "location", "status", "isPremium"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();

    res.status(200).json({
      message: "Cập nhật tin tuyển dụng thành công",
      data: job
    });
  } catch (error) {
    console.error("Update Job Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const job = await Job.findOneAndDelete({ _id: jobId, recruiterId });
    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    // Delete associated applications
    await JobApplication.deleteMany({ jobId });

    res.status(200).json({
      message: "Xóa tin tuyển dụng thành công"
    });
  } catch (error) {
    console.error("Delete Job Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  createJob,
  applyJob,
  getJobDetail,
  getMyJobs,
  toggleJobStatus,
  saveJob,
  getSavedJobs,
  updateJob,
  deleteJob
};
