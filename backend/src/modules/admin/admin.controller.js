import { UserModel } from "../users/user.model.js";
import Job from "../jobs/job.model.js";
import JobApplication from "../Application/jobApplication.model.js";

export class AdminController {
    // ========================
    // GET ALL USERS (with filter & pagination)
    // ========================
    static async getAllUsers(req, res) {
        try {
            const { role, search, isActive, page = 1, limit = 20 } = req.query;
            const filter = {};
            if (role) filter.role = role;
            if (isActive !== undefined) filter.isActive = isActive === "true";
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }

            const skip = (Number(page) - 1) * Number(limit);
            const [users, total] = await Promise.all([
                UserModel.find(filter)
                    .select("-password -otp -otpExpires")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                UserModel.countDocuments(filter),
            ]);

            return res.status(200).json({
                users,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            });
        } catch (error) {
            console.error("Admin getAllUsers error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // ========================
    // TOGGLE USER ACTIVE STATUS
    // ========================
    static async toggleUserActive(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserModel.findById(userId);
            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

            user.isActive = !user.isActive;
            await user.save();

            return res.status(200).json({
                message: user.isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
                isActive: user.isActive,
            });
        } catch (error) {
            console.error("Admin toggleUserActive error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // ========================
    // GET EMPLOYERS (with approval status filter)
    // ========================
    static async getEmployers(req, res) {
        try {
            const { search, isApproved, page = 1, limit = 20 } = req.query;
            const filter = { role: "EMPLOYER" };

            if (isApproved === "true") filter.isApproved = true;
            else if (isApproved === "false") filter.isApproved = { $ne: true };

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { companyName: { $regex: search, $options: "i" } },
                ];
            }

            const skip = (Number(page) - 1) * Number(limit);
            const [employers, total] = await Promise.all([
                UserModel.find(filter)
                    .select("-password -otp -otpExpires")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                UserModel.countDocuments(filter),
            ]);

            return res.status(200).json({
                employers,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            });
        } catch (error) {
            console.error("Admin getEmployers error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // ========================
    // APPROVE / REJECT EMPLOYER
    // ========================
    static async updateEmployerApproval(req, res) {
        try {
            const { userId } = req.params;
            const { isApproved } = req.body;

            if (typeof isApproved !== "boolean") {
                return res.status(400).json({ message: "isApproved phải là boolean" });
            }

            // Kiểm tra user tồn tại và là Employer
            const existing = await UserModel.findOne({ _id: userId, role: "EMPLOYER" });
            if (!existing) return res.status(404).json({ message: "Nhà tuyển dụng không tồn tại" });

            // Dùng findByIdAndUpdate để đảm bảo cập nhật atomic, tránh schema cache
            const updated = await UserModel.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        isApproved: isApproved,
                        isActive: isApproved,
                    }
                },
                { new: true, runValidators: false }
            );

            return res.status(200).json({
                message: isApproved ? "Đã duyệt nhà tuyển dụng" : "Đã từ chối nhà tuyển dụng",
                isApproved: updated.isApproved,
                isActive: updated.isActive,
            });
        } catch (error) {
            console.error("Admin updateEmployerApproval error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // ========================
    // GET ALL JOBS (admin view with filters)
    // ========================
    static async getAllJobs(req, res) {
        try {
            const { status, search, page = 1, limit = 20 } = req.query;
            const filter = {};
            if (status) filter.status = status;
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { "location.city": { $regex: search, $options: "i" } },
                    { "location.country": { $regex: search, $options: "i" } },
                ];
            }

            const skip = (Number(page) - 1) * Number(limit);
            const [jobs, total] = await Promise.all([
                Job.find(filter)
                    .populate("recruiterId", "name companyName email")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                Job.countDocuments(filter),
            ]);

            return res.status(200).json({
                jobs,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            });
        } catch (error) {
            console.error("Admin getAllJobs error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // ========================
    // UPDATE JOB STATUS (approve/reject/close)
    // ========================
    static async updateJobStatus(req, res) {
        try {
            const { jobId } = req.params;
            const { status } = req.body;

            const validStatuses = ["open", "closed", "pending"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: "Trạng thái không hợp lệ" });
            }

            const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true });
            if (!job) return res.status(404).json({ message: "Tin tuyển dụng không tồn tại" });

            return res.status(200).json({ message: "Cập nhật trạng thái thành công", job });
        } catch (error) {
            console.error("Admin updateJobStatus error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // ========================
    // DELETE JOB (admin force delete)
    // ========================
    static async deleteJob(req, res) {
        try {
            const { jobId } = req.params;
            const job = await Job.findByIdAndDelete(jobId);
            if (!job) return res.status(404).json({ message: "Tin tuyển dụng không tồn tại" });
            await JobApplication.deleteMany({ jobId });
            return res.status(200).json({ message: "Đã xóa tin tuyển dụng" });
        } catch (error) {
            console.error("Admin deleteJob error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // ========================
    // SYSTEM STATS OVERVIEW
    // ========================
    static async getStats(req, res) {
        try {
            const [
                totalUsers,
                totalJobSeekers,
                totalEmployers,
                totalJobs,
                totalApplications,
                activeUsers,
                openJobs,
                pendingEmployers,
            ] = await Promise.all([
                UserModel.countDocuments(),
                UserModel.countDocuments({ role: "JOB_SEEKER" }),
                UserModel.countDocuments({ role: "EMPLOYER" }),
                Job.countDocuments(),
                JobApplication.countDocuments(),
                UserModel.countDocuments({ isActive: true }),
                Job.countDocuments({ status: "open" }),
                UserModel.countDocuments({ role: "EMPLOYER", isApproved: { $ne: true } }),
            ]);

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const newUsersThisWeek = await UserModel.countDocuments({
                createdAt: { $gte: sevenDaysAgo },
            });

            const newApplicationsThisWeek = await JobApplication.countDocuments({
                appliedAt: { $gte: sevenDaysAgo },
            });

            return res.status(200).json({
                totalUsers,
                totalJobSeekers,
                totalEmployers,
                totalJobs,
                totalApplications,
                activeUsers,
                openJobs,
                pendingEmployers,
                newUsersThisWeek,
                newApplicationsThisWeek,
            });
        } catch (error) {
            console.error("Admin getStats error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }
}
