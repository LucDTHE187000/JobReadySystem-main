import { Router } from "express";
import { NotificationController } from "./notification.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, NotificationController.getNotifications);
router.put("/mark-all-read", authMiddleware, NotificationController.markAllRead);
router.put("/:id/read", authMiddleware, NotificationController.markRead);

export default router;
