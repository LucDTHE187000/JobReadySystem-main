import Notification from "./notification.model.js";

export class NotificationService {
  /**
   * Tạo thông báo mới cho người dùng
   * @param {string} userId - ID người nhận
   * @param {string} title - Tiêu đề
   * @param {string} description - Chi tiết thông báo
   * @param {string} type - Loại thông báo
   */
  static async createNotification(userId, title, description, type = "info") {
    try {
      if (!userId || !title || !description) return null;
      
      const notification = await Notification.create({
        userId,
        title,
        description,
        type,
      });
      return notification;
    } catch (error) {
      console.error("Create notification helper failed:", error);
      return null;
    }
  }

  /**
   * Lấy danh sách thông báo của người dùng
   * @param {string} userId - ID người dùng
   */
  static async getNotificationsForUser(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Đánh dấu toàn bộ thông báo của người dùng là đã đọc
   * @param {string} userId - ID người dùng
   */
  static async markAllAsRead(userId) {
    return await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  }

  /**
   * Đánh dấu 1 thông báo cụ thể là đã đọc
   * @param {string} notificationId - ID thông báo
   * @param {string} userId - ID người dùng (để bảo mật)
   */
  static async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }
}
