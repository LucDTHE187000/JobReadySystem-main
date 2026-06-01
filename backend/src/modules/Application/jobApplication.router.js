import express from "express";
import { getCompanyApplicants, setInterviewDate, getMyApplications } from "./jobApplication.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import jobController from "../jobs/job.controller.js";

const router = express.Router();

// Ứng viên apply job
router.post("/", authMiddleware, jobController.applyJob);

// Ứng viên xem lịch sử ứng tuyển của mình
router.get("/my", authMiddleware, getMyApplications);

// Lấy tất cả ứng viên apply vào các job của công ty
router.get(
    "/company/applicants",
    authMiddleware, // bắt buộc login
    getCompanyApplicants
);
router.put(
    "/:id/interview",
    authMiddleware,
    setInterviewDate
);
export default router;
