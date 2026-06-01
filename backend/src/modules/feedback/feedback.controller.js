import FeedbackModel from "./feedback.model.js";
import { ROLES } from "../../config/roles.config.js";

export const FeedbackController = {
  async submitFeedback(req, res) {
    try {
      const { type, subject, message } = req.body;

      if (!type || !subject || !message) {
        return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin feedback." });
      }

      const feedback = new FeedbackModel({
        userId: req.user.userId,
        userEmail: req.user.email || "",
        type,
        subject,
        message,
      });

      await feedback.save();

      return res.status(201).json({ message: "Feedback đã được gửi thành công." });
    } catch (error) {
      console.error("Feedback save error:", error);
      return res.status(500).json({ message: "Không thể gửi feedback vào lúc này." });
    }
  },

  async listFeedbacks(req, res) {
    try {
      if (![ROLES.EMPLOYER, ROLES.ADMIN].includes(req.user.role)) {
        return res.status(403).json({ message: "Chỉ nhà tuyển dụng hoặc admin mới có quyền truy cập." });
      }

      const feedbacks = await FeedbackModel.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json({ feedbacks });
    } catch (error) {
      console.error("Feedback list error:", error);
      return res.status(500).json({ message: "Không thể tải danh sách feedback." });
    }
  },
};
