import fs from "fs";
import { UserModel } from "../modules/users/user.model.js";
import InterviewSessionModel from "../modules/interview/interview.model.js";

async function runHistoryCleanup() {
  console.log("🧹 [History Cleanup] Bắt đầu quét và dọn dẹp lịch sử quá hạn...");
  try {
    const now = new Date();
    const limit30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const limit90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // --- 1. LẤY DANH SÁCH USER PHÂN LOẠI ---
    const freeStarterUsers = await UserModel.find({
      $or: [
        { activePlan: { $exists: false } },
        { activePlan: null },
        { activePlan: "free" },
        { activePlan: "starter" }
      ]
    }).select("_id");
    const freeStarterUserIds = freeStarterUsers.map(u => u._id);

    const proUsers = await UserModel.find({ activePlan: "pro" }).select("_id");
    const proUserIds = proUsers.map(u => u._id);

    // --- 2. XÓA LỊCH SỬ PHỎNG VẤN (INTERVIEW SESSIONS) ---
    
    // Xóa session quá 30 ngày của Free/Starter users
    const deletedFreeStarterSessions = await InterviewSessionModel.deleteMany({
      userId: { $in: freeStarterUserIds },
      createdAt: { $lt: limit30Days }
    });
    if (deletedFreeStarterSessions.deletedCount > 0) {
      console.log(`🧹 [History Cleanup] Đã xóa ${deletedFreeStarterSessions.deletedCount} phiên phỏng vấn quá 30 ngày của user Free/Starter.`);
    }

    // Xóa session quá 90 ngày của Pro users
    const deletedProSessions = await InterviewSessionModel.deleteMany({
      userId: { $in: proUserIds },
      createdAt: { $lt: limit90Days }
    });
    if (deletedProSessions.deletedCount > 0) {
      console.log(`🧹 [History Cleanup] Đã xóa ${deletedProSessions.deletedCount} phiên phỏng vấn quá 90 ngày của user Pro.`);
    }

    // --- 3. DỌN DẸP CVS (DATABASE + DISK) ---

    // A. Quét và dọn dẹp CVs của Free/Starter users (Quá 30 ngày)
    const freeStarterUsersWithExpiredCvs = await UserModel.find({
      _id: { $in: freeStarterUserIds },
      "cvs.uploadedAt": { $lt: limit30Days }
    });

    for (const u of freeStarterUsersWithExpiredCvs) {
      const expiredCvs = u.cvs.filter(cv => cv.uploadedAt < limit30Days);
      for (const cv of expiredCvs) {
        if (cv.filePath) {
          try {
            if (fs.existsSync(cv.filePath)) {
              fs.unlinkSync(cv.filePath);
              console.log(`🧹 [History Cleanup] Đã xóa file CV quá hạn trên ổ đĩa: ${cv.filePath}`);
            }
          } catch (fileErr) {
            console.error(`❌ [History Cleanup] Lỗi xóa file CV ${cv.filePath}:`, fileErr.message);
          }
        }
      }
      // Giữ lại CVs chưa hết hạn
      u.cvs = u.cvs.filter(cv => cv.uploadedAt >= limit30Days);
      await u.save();
    }

    // B. Quét và dọn dẹp CVs của Pro users (Quá 90 ngày)
    const proUsersWithExpiredCvs = await UserModel.find({
      _id: { $in: proUserIds },
      "cvs.uploadedAt": { $lt: limit90Days }
    });

    for (const u of proUsersWithExpiredCvs) {
      const expiredCvs = u.cvs.filter(cv => cv.uploadedAt < limit90Days);
      for (const cv of expiredCvs) {
        if (cv.filePath) {
          try {
            if (fs.existsSync(cv.filePath)) {
              fs.unlinkSync(cv.filePath);
              console.log(`🧹 [History Cleanup] Đã xóa file CV quá hạn trên ổ đĩa: ${cv.filePath}`);
            }
          } catch (fileErr) {
            console.error(`❌ [History Cleanup] Lỗi xóa file CV ${cv.filePath}:`, fileErr.message);
          }
        }
      }
      u.cvs = u.cvs.filter(cv => cv.uploadedAt >= limit90Days);
      await u.save();
    }

    console.log("🧹 [History Cleanup] Hoàn thành dọn dẹp lịch sử thành công.");
  } catch (error) {
    console.error("❌ [History Cleanup] Lỗi trong tiến trình dọn dẹp lịch sử:", error);
  }
}

// Hàm khởi chạy bộ lập lịch dọn dẹp lịch sử
export function startHistoryCleanupScheduler() {
  console.log("⏰ [History Cleanup] Bộ lập lịch dọn dẹp lịch sử đã được đăng ký.");
  
  // Chạy lần đầu tiên sau khi server khởi động 15 giây
  setTimeout(runHistoryCleanup, 15000);
  
  // Lặp lại mỗi 24 giờ
  setInterval(runHistoryCleanup, 24 * 60 * 60 * 1000);
}
