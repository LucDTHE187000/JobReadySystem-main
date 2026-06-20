import FeedbackModel from "./feedback.model.js";
import { ROLES } from "../../config/roles.config.js";
import { UserModel } from "../users/user.model.js";
import { 
  sendFeedbackConfirmationEmail, 
  sendAdminFeedbackNotificationEmail 
} from "../../utils/email.util.js";

export const FeedbackController = {
  async submitFeedback(req, res) {
    try {
      const { type, subject, message, rating, checkedOptions } = req.body;

      if (!type || !subject || !message) {
        return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin feedback." });
      }

      const feedback = new FeedbackModel({
        userId: req.user.userId,
        userEmail: req.user.email || "",
        type,
        subject,
        message,
        rating,
        checkedOptions,
      });

      await feedback.save();

      // Lấy thông tin họ tên user để cá nhân hóa email
      const user = await UserModel.findById(req.user.userId).select("name").lean();
      const userName = user?.name || "Người dùng JobReady";

      // Gửi email xác nhận và thông báo bất đồng bộ
      sendFeedbackConfirmationEmail(req.user.email, userName, {
        type,
        subject,
        message,
        rating,
        checkedOptions,
      }).catch((err) => console.error("Error sending user feedback confirmation email:", err));

      sendAdminFeedbackNotificationEmail(req.user.email, userName, {
        type,
        subject,
        message,
        rating,
        checkedOptions,
      }).catch((err) => console.error("Error sending admin feedback notification email:", err));

      return res.status(201).json({ message: "Feedback đã được gửi thành công." });
    } catch (error) {
      console.error("Feedback save error:", error);
      return res.status(500).json({ message: "Không thể gửi feedback vào lúc này." });
    }
  },

  async listFeedbacks(req, res) {
    try {
      // Chỉ cho phép ADMIN truy cập, EMPLOYER không được phép
      if (req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Chỉ quản trị viên mới có quyền xem feedback." });
      }

      const feedbacks = await FeedbackModel.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json({ feedbacks });
    } catch (error) {
      console.error("Feedback list error:", error);
      return res.status(500).json({ message: "Không thể tải danh sách feedback." });
    }
  },
};
