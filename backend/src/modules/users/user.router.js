import { Router } from "express";
import { UserController } from "./user.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const userRouter = Router();

// Các endpoint dưới đây đều yêu cầu xác thực
userRouter.use(authMiddleware);

// Cập nhật thông tin profile
userRouter.put("/profile", UserController.updateProfile);

// Đổi mật khẩu
userRouter.post("/change-password", UserController.changePassword);

// Nạp credit
userRouter.post("/credits/topup", UserController.topupCredits);

// Tìm kiếm ứng viên (dành cho Recruiter)
userRouter.get("/candidates/search", UserController.searchCandidates);
userRouter.post("/candidates/contact", UserController.contactCandidate);
