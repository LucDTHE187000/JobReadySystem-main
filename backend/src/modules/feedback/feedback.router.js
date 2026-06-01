import { Router } from "express";
import { FeedbackController } from "./feedback.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, FeedbackController.submitFeedback);
router.get("/", authMiddleware, FeedbackController.listFeedbacks);

export default router;
