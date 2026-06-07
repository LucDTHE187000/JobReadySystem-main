import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const adminRouter = Router();

// Admin middleware - require auth + admin role
const adminOnly = [
    authMiddleware,
    (req, res, next) => {
        if (req.user?.role !== "ADMIN" && req.user?.userContext?.role !== "ADMIN") {
            return res.status(403).json({ message: "Chỉ Admin mới có quyền truy cập" });
        }
        next();
    },
];

// ===== USER MANAGEMENT =====
adminRouter.get("/users", adminOnly, AdminController.getAllUsers);
adminRouter.put("/users/:userId/toggle-active", adminOnly, AdminController.toggleUserActive);

// ===== EMPLOYER APPROVAL =====
adminRouter.get("/employers", adminOnly, AdminController.getEmployers);
adminRouter.put("/employers/:userId/approval", adminOnly, AdminController.updateEmployerApproval);

// ===== JOB MANAGEMENT =====
adminRouter.get("/jobs", adminOnly, AdminController.getAllJobs);
adminRouter.put("/jobs/:jobId/status", adminOnly, AdminController.updateJobStatus);
adminRouter.delete("/jobs/:jobId", adminOnly, AdminController.deleteJob);

// ===== PAYMENT MANAGEMENT =====
adminRouter.get("/payments", adminOnly, AdminController.getAllPayments);

// ===== SYSTEM STATS =====
adminRouter.get("/stats", adminOnly, AdminController.getStats);
