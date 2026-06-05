import express from "express";
import controller from "./course.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, controller.getCourses);
router.get("/:id", authMiddleware, controller.getCourseDetail);

export { router as courseRouter };
