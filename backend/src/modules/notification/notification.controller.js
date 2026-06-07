import { NotificationService } from "./notification.service.js";

export class NotificationController {
  static async getNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const notifications = await NotificationService.getNotificationsForUser(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  static async markAllRead(req, res) {
    try {
      const userId = req.user.userId;
      await NotificationService.markAllAsRead(userId);
      return res.status(200).json({ message: "Đã đánh dấu đọc toàn bộ thông báo" });
    } catch (error) {
      console.error("Mark all read error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  static async markRead(req, res) {
    try {
      const userId = req.user.userId;
      const notificationId = req.params.id;
      const notification = await NotificationService.markAsRead(notificationId, userId);
      if (!notification) {
        return res.status(404).json({ message: "Không tìm thấy thông báo" });
      }
      return res.status(200).json(notification);
    } catch (error) {
      console.error("Mark read error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }
}
