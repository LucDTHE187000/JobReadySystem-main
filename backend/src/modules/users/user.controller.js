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
}
