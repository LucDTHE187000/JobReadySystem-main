import mongoose from "mongoose";
import Job from "./job.model.js";
import JobApplication from "../Application/jobApplication.model.js";
import { deductCredits, CREDIT_COSTS } from "../../utils/credit.util.js";
import { UserModel } from "../users/user.model.js";
import geminiService from "../../config/gemini.service.js";
import InterviewSession from "../interview/interview.model.js";

/* ========================= */
/* Tạo Job */
/* ========================= */
const createJob = async (req, res) => {
  try {
    // 🔥 Kiểm tra xem tài khoản nhà tuyển dụng đã được Admin phê duyệt chưa
    const userObj = await UserModel.findById(req.user.userId);
    if (!userObj) {
      return res.status(404).json({ message: "Không tìm thấy thông tin tài khoản tuyển dụng." });
    }

    if (userObj.role === "EMPLOYER" && !userObj.isApproved) {
      return res.status(403).json({
        message: "Tài khoản của bạn chưa được Admin phê duyệt. Vui lòng liên hệ Admin hoặc đợi duyệt thông tin doanh nghiệp trước khi đăng tin tuyển dụng.",
      });
    }

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

    // 🔥 Trừ credit cho việc apply job (Bỏ: free theo yêu cầu)
    // try {
    //   await deductCredits(jobseekerId, CREDIT_COSTS.JOB_APPLY, UserModel);
    // } catch (creditErr) {
    //   return res.status(creditErr.status || 402).json({
    //     error: creditErr.message || 'Không đủ credit để apply job',
    //   });
    // }

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

    // Tạo thông báo cho ứng viên & nhà tuyển dụng
    try {
      const { NotificationService } = await import("../notification/notification.service.js");
      await NotificationService.createNotification(
        jobseekerId,
        "Ứng tuyển thành công",
        `Hồ sơ của bạn cho vị trí "${job.title}" đã được gửi đi thành công.`,
        "application"
      );
      await NotificationService.createNotification(
        job.recruiterId,
        "Ứng tuyển mới",
        `Một ứng viên vừa nộp hồ sơ ứng tuyển vị trí "${job.title}".`,
        "application"
      );
    } catch (notiErr) {
      console.error("Failed to create application notifications:", notiErr);
    }

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

const getJobRecommendationsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Mã phiên phỏng vấn không hợp lệ" });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Không tìm thấy phiên phỏng vấn" });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xem gợi ý của phiên phỏng vấn này" });
    }

    // Kiểm tra đã hoàn thành phỏng vấn chưa
    const isCompleted = session.status === 'completed' && session.answeredQuestions >= 10;
    if (!isCompleted) {
      return res.status(200).json({
        success: false,
        completed: false,
        message: "Phiên phỏng vấn chưa hoàn thành hoặc chưa trả lời đủ 10 câu hỏi để nhận gợi ý việc làm từ AI."
      });
    }

    // Đánh giá điểm đạt (AI dễ tính một chút: từ 50 điểm trở lên)
    const passed = session.averageScore >= 50;

    if (!passed) {
      const prompt = `Bạn là cố vấn sự nghiệp AI tại hệ thống JobReady. Ứng viên vừa tham gia phỏng vấn vị trí "${session.jobTitle}" nhưng kết quả chưa đạt yêu cầu.
      Thông tin kết quả:
      - Điểm trung bình: ${session.averageScore}/100
      - Các điểm mạnh: ${session.strengths?.join(", ") || "Chưa xác định"}
      - Các điểm cần cải thiện: ${session.improvements?.join(", ") || "Chưa xác định"}
      - Nhận xét chung: ${session.overallFeedback || ""}

      Hãy viết một thông điệp nhận xét và khuyên nhủ cá nhân hóa bằng Tiếng Việt (khoảng 3-4 câu) gửi đến ứng viên.
      Hãy chỉ ra một cách tinh tế rằng với kết quả và kỹ năng hiện tại họ chưa thực sự phù hợp với công việc này, khuyên họ nên ôn tập lại các điểm yếu đã nêu và khuyến khích họ rèn luyện thêm rồi thử sức phỏng vấn lại.
      Tuyệt đối không sử dụng định dạng Markdown đặc biệt, chỉ viết văn bản thuần túy và thân thiện.`;
      
      let aiMessage = "";
      try {
        aiMessage = await geminiService.generateWithPrompt(prompt);
      } catch (geminiErr) {
        aiMessage = `Kết quả phỏng vấn của bạn đạt ${session.averageScore}/100. Hiện tại các kỹ năng của bạn chưa hoàn toàn phù hợp với vị trí này. Hãy xem lại các góp ý chi tiết từ AI và rèn luyện thêm để nâng cao trình độ nhé!`;
      }

      return res.status(200).json({
        success: true,
        completed: true,
        passed: false,
        message: aiMessage,
        data: []
      });
    }

    // Nếu đạt, tìm job tuyển dụng đang mở
    const jobs = await Job.find({ status: "open" }).populate("recruiterId", "name companyName avatar avatarUrl").lean();
    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        completed: true,
        passed: true,
        message: `Chúc mừng bạn đã đạt kết quả phỏng vấn rất khả quan (${session.averageScore}/100)! Hệ thống hiện chưa có tin tuyển dụng phù hợp với vị trí này, vui lòng tham khảo thêm các cơ hội từ bên ngoài qua TopCV nhé!`,
        data: []
      });
    }

    // Gọi Gemini để chọn và viết lý do phù hợp
    const prompt = `Bạn là chuyên gia tuyển dụng và cố vấn sự nghiệp AI tại JobReady.
    Ứng viên vừa hoàn thành buổi phỏng vấn thử vị trí "${session.jobTitle}".
    Thông tin ứng viên:
    - Điểm trung bình phỏng vấn: ${session.averageScore}/100
    - Các điểm mạnh: ${session.strengths?.join(", ") || "Chưa xác định"}
    - Các điểm cần cải thiện: ${session.improvements?.join(", ") || "Chưa xác định"}
    - Nhận xét chung: ${session.overallFeedback || ""}

    Dưới đây là danh sách các tin tuyển dụng đang tuyển trên hệ thống:
    ${jobs.map((j, idx) => `STT: ${idx + 1}
    ID: ${j._id}
    Tiêu đề công việc: ${j.title}
    Mô tả công việc: ${j.description}
    Yêu cầu: ${j.requirements || "Không có"}
    Địa điểm: ${j.location?.city || "Việt Nam"}
    ---`).join("\n")}

    Hãy thực hiện hai nhiệm vụ:
    1. Hãy chọn ra tối đa 3 công việc phù hợp nhất với kỹ năng và thế mạnh của ứng viên.
    2. Hãy viết một đoạn thông điệp nhận xét cá nhân hóa bằng Tiếng Việt (khoảng 3-4 câu) gửi đến ứng viên để giải thích lý do tại sao họ lại được đề xuất những công việc này dựa trên những điểm mạnh mà họ đã chứng minh được trong buổi phỏng vấn.

    Hãy trả về duy nhất một định dạng JSON theo mẫu sau:
    \`\`\`json
    {
      "message": "Đoạn thông điệp nhận xét cá nhân hóa gửi đến ứng viên...",
      "recommendations": [
        {
          "jobId": "chuỗi ID của công việc phù hợp",
          "matchScore": 92,
          "matchReason": "Giải thích ngắn gọn tại sao công việc này phù hợp với họ..."
        }
      ]
    }
    \`\`\`
    Tuyệt đối chỉ trả về khối JSON hợp lệ. Không viết thêm bất kỳ văn bản nào khác ngoài khối mã JSON.`;

    let aiResult = null;
    try {
      const responseText = await geminiService.generateWithPrompt(prompt);
      aiResult = geminiService.parseJsonResponse(responseText);
    } catch (geminiErr) {
      console.error("Gemini recommendation error:", geminiErr);
    }

    let recommendedJobs = [];
    if (aiResult && Array.isArray(aiResult.recommendations)) {
      recommendedJobs = aiResult.recommendations.map(rec => {
        const job = jobs.find(j => j._id.toString() === rec.jobId.toString());
        if (job) {
          return {
            ...job,
            matchScore: rec.matchScore,
            matchReason: rec.matchReason
          };
        }
        return null;
      }).filter(Boolean);
    }

    if (recommendedJobs.length === 0) {
      recommendedJobs = jobs.slice(0, 3).map(j => ({
        ...j,
        matchScore: 80,
        matchReason: `Vị trí công việc phù hợp với lĩnh vực ${session.jobCategory} của bạn.`
      }));
    }

    const responseMessage = aiResult?.message || `Chúc mừng bạn đã hoàn thành xuất sắc buổi phỏng vấn vị trí ${session.jobTitle} với số điểm ${session.averageScore}/100! Dưới đây là các vị trí công việc mà AI gợi ý phù hợp nhất với năng lực của bạn.`;

    return res.status(200).json({
      success: true,
      completed: true,
      passed: true,
      message: responseMessage,
      data: recommendedJobs
    });

  } catch (error) {
    console.error("Get job recommendations error:", error);
    return res.status(555).json({ message: "Không thể lấy gợi ý việc làm." });
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
  deleteJob,
  getJobRecommendationsBySession
};
