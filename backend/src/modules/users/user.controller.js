import { UserService } from "./user.service.js";
import { z } from "zod";

const updateProfileSchema = z.object({
    name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự").max(100, "Họ và tên không vượt quá 100 ký tự").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().optional(),
    avatarUrl: z.string().url("Dữ liệu avatar url không hợp lệ").optional().or(z.literal('')),
    language: z.enum(["EN", "VI"]).optional(),

    // For Job Seeker
    resume: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experience: z.string().optional(),
    education: z.string().optional(),

    // For Employer
    companyName: z.string().optional(),
    companyDescription: z.string().optional(),
    companyWebsite: z.string().optional(),
});

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Mật khẩu cũ không được để trống"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự").max(100, "Mật khẩu mới không vượt quá 100 ký tự"),
});

export class UserController {
    static async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const parse = updateProfileSchema.safeParse(req.body);

            if (!parse.success) {
                return res.status(400).json({
                    message: "Dữ liệu không hợp lệ",
                    errors: parse.error.flatten()
                });
            }

            const updatedUser = await UserService.updateProfile(userId, parse.data);
            return res.status(200).json({
                message: "Cập nhật thông tin thành công",
                user: updatedUser
            });
        } catch (error) {
            console.error("Update profile error:", error);
            if (error.message === "User not found") {
                return res.status(404).json({ message: "Người dùng không tồn tại" });
            }
            return res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
        }
    }

    static async changePassword(req, res) {
        try {
            const userId = req.user.userId;
            const parse = changePasswordSchema.safeParse(req.body);

            if (!parse.success) {
                return res.status(400).json({
                    message: "Dữ liệu không hợp lệ",
                    errors: parse.error.flatten()
                });
            }

            const result = await UserService.changePassword(userId, parse.data.oldPassword, parse.data.newPassword);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Change password error:", error);
            if (error.message === "User not found") {
                return res.status(404).json({ message: "Người dùng không tồn tại" });
            }
            if (error.message === "Mật khẩu cũ không chính xác") {
                return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
            }
            return res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
        }
    }

    /** Nạp credit (sau thanh toán / gói) */
    static async topupCredits(req, res) {
        try {
            const userId = req.user.userId;
            const amount = Number(req.body.amount) || 0;
            if (amount <= 0) {
                return res.status(400).json({ message: 'Số credit không hợp lệ' });
            }
            const { addCredits } = await import('../../utils/credit.util.js');
            const { UserModel } = await import('./user.model.js');
            const balance = await addCredits(userId, amount, UserModel);
            return res.status(200).json({ message: 'Nạp credit thành công', credits: balance });
        } catch (error) {
            console.error('Topup credits error:', error);
            return res.status(500).json({ message: error.message || 'Lỗi nạp credit' });
        }
    }

    /** Tìm kiếm ứng viên (dành cho Recruiter) */
    static async searchCandidates(req, res) {
        try {
            const { skills, experience, education, search, page = 1, limit = 12 } = req.query;
            const filter = { role: 'JOB_SEEKER', isActive: true };

            if (skills) {
                const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
                if (skillList.length > 0) {
                    filter.skills = { $in: skillList.map(s => new RegExp(s, 'i')) };
                }
            }
            if (experience) filter.experience = { $regex: experience, $options: 'i' };
            if (education) filter.education = { $regex: education, $options: 'i' };
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { skills: { $in: [new RegExp(search, 'i')] } },
                ];
            }

            const skip = (Number(page) - 1) * Number(limit);
            const { UserModel } = await import('./user.model.js');
            const [candidates, total] = await Promise.all([
                UserModel.find(filter)
                    .select('name email skills experience education avatarUrl createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                UserModel.countDocuments(filter),
            ]);

            return res.status(200).json({
                candidates,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
            });
        } catch (error) {
            console.error('Search candidates error:', error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async contactCandidate(req, res) {
        try {
            const { candidateEmail, subject, body } = req.body;
            if (!candidateEmail || !subject || !body) {
                return res.status(400).json({ message: "Thiếu thông tin người nhận, tiêu đề hoặc nội dung email" });
            }

            const { sendContactEmail } = await import("../../utils/email.util.js");
            const { UserModel } = await import("./user.model.js");
            const recruiter = await UserModel.findById(req.user.userId).select("name companyName").lean();
            const senderName = recruiter ? (recruiter.companyName || recruiter.name) : "Nhà tuyển dụng";

            const result = await sendContactEmail(candidateEmail, subject, body, senderName);
            if (result.success) {
                // Tạo thông báo cho ứng viên
                try {
                    const candidate = await UserModel.findOne({ email: candidateEmail });
                    if (candidate) {
                        const { NotificationService } = await import("../notification/notification.service.js");
                        await NotificationService.createNotification(
                            candidate._id,
                            `Tin nhắn từ nhà tuyển dụng`,
                            `Nhà tuyển dụng ${senderName} đã gửi thư liên hệ với bạn: "${subject}"`,
                            "feedback"
                        );
                    }
                } catch (notiErr) {
                    console.error("Failed to create contact candidate notification:", notiErr);
                }

                return res.status(200).json({ message: "Gửi email thành công", devMode: result.devMode });
            } else {
                return res.status(500).json({ message: result.error || "Gửi email thất bại" });
            }
        } catch (error) {
            console.error("Contact candidate error:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }
}
