import { Router } from "express";
import { BlogController } from "./blog.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, BlogController.createBlog);
router.get("/my", authMiddleware, BlogController.getMyBlogs);
router.get("/approved", BlogController.getApprovedBlogs);

export default router;
