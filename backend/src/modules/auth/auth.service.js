import { UserModel } from "../users/user.model.js";
import { OtpModel } from "../otp/otp.model.js";
import { generateTokenFromUser } from "../../utils/jwt.util.js";
import { generateOTP, generateOTPExpiry } from "../../utils/otp.util.js";
import { sendOTPEmail, sendResetPasswordEmail } from "../../utils/email.util.js";

export class AuthService {
    // Đăng ký tài khoản mới
    static async register(userData) {
        const { email, password, name, role } = userData;

        // Normalize email (lowercase, trim)
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedName = name.trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            throw new Error("Email không hợp lệ");
        }

        // Validate name length
        if (normalizedName.length < 2) {
            throw new Error("Họ và tên phải có ít nhất 2 ký tự");
        }

        // Check if email already exists
        const existed = await UserModel.findOne({ email: normalizedEmail });
        if (existed) {
            throw new Error("Email already registered");
        }

        // Tạo tài khoản mới - Verify email directly (no OTP required)
        let user;
        try {
            user = await UserModel.create({
                email: normalizedEmail,
                password,
                name: normalizedName,
                role: role || "JOB_SEEKER",
                isVerified: true,
            });
        } catch (error) {
            if (error.code === 11000 || error.message.includes("duplicate")) {
                throw new Error("Email already registered");
            }
            throw error;
        }

        return {
            message: "Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.",
            userId: user._id,
            email: user.email,
        };
    }

    // Xác thực OTP
    static async verifyOTP(email, otp) {
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("User not found");
        if (user.isVerified) throw new Error("Email already verified");

        // Lấy OTP trong bảng OtpModel
        const otpRecord = await OtpModel.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord) throw new Error("OTP not found. Please request a new one.");

        if (new Date() > otpRecord.expiresAt) {
            throw new Error("OTP expired. Please request a new OTP.");
        }

        if (otpRecord.code !== otp.trim()) {
            throw new Error("Invalid OTP");
        }

        // Cập nhật user và xóa OTP
        user.isVerified = true;
        await user.save();

        await OtpModel.deleteMany({ email });

        const token = generateTokenFromUser(user);
        return {
            message: "Email verified successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                language: user.language,
            },
        };
    }

    // Gửi lại OTP
    static async resendOTP(email) {
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("User not found");
        if (user.isVerified) throw new Error("Email already verified");

        const otpCode = generateOTP();
        const otpExpires = generateOTPExpiry();

        await OtpModel.create({
            userId: user._id,
            email,
            code: otpCode,
            purpose: "verify_email",
            expiresAt: otpExpires,
        });

        const emailResult = await sendOTPEmail(email, otpCode, user.name);
        if (!emailResult.success) {
            console.warn("⚠️  Email không gửi được, nhưng OTP đã được tạo. User có thể xem OTP trong console.");
        }

        return { message: "New OTP sent successfully. Please check your email." };
    }

    // Đăng nhập
    static async login(credentials) {
        const { email, password } = credentials;
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("Invalid credentials");
        if (!user.isVerified) throw new Error("Email not verified");
        if (user.isActive === false) {
            throw new Error("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) throw new Error("Invalid credentials");

        const token = generateTokenFromUser(user);
        return {
            token,
            user: {
                id: user._id,
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                language: user.language,
                credits: user.credits ?? 14000,
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || '',
                avatarUrl: user.avatarUrl || '',
                skills: user.skills || [],
                experience: user.experience || '',
                education: user.education || '',
                companyName: user.companyName || '',
                companyDescription: user.companyDescription || '',
                companyWebsite: user.companyWebsite || '',
            },
        };
    }

    // Lấy user hiện tại
    static async getCurrentUser(userId) {
        const user = await UserModel.findById(userId)
            .select("-password -otp -otpExpires");
        if (!user) throw new Error("User not found");
        return user;
    }

    // Quên mật khẩu - Gửi OTP để reset password
    static async forgotPassword(email) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return {
                success: true,
                message: "If the email exists, an OTP has been sent to your email."
            };
        }

        if (!user.isVerified) {
            throw new Error("Email not verified. Please verify your email first.");
        }

        const otpCode = generateOTP();
        const otpExpires = generateOTPExpiry();

        // Xóa các OTP quên mật khẩu trước đó
        await OtpModel.deleteMany({
            email,
            purpose: "forgot_password",
        });

        await OtpModel.create({
            userId: user._id,
            email,
            code: otpCode,
            purpose: "forgot_password",
            expiresAt: otpExpires,
            verified: false,
        });

        const emailResult = await sendResetPasswordEmail(email, otpCode, user.name);
        if (!emailResult.success) {
            console.warn("⚠️  Email không gửi được, nhưng OTP đã được tạo. User có thể xem OTP trong console.");
        }

        return {
            success: true,
            message: "If the email exists, an OTP has been sent to your email."
        };
    }

    // Xác thực OTP để reset password
    static async verifyResetOtp(email, otp) {
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("User not found");

        const otpRecord = await OtpModel.findOne({
            email,
            purpose: "forgot_password"
        }).sort({ createdAt: -1 });

        if (!otpRecord) throw new Error("OTP not found. Please request a new one.");

        if (new Date() > otpRecord.expiresAt) {
            await OtpModel.deleteMany({ email, purpose: "forgot_password" });
            throw new Error("OTP expired. Please request a new OTP.");
        }

        if (otpRecord.code !== otp.trim()) {
            throw new Error("Invalid OTP");
        }

        // Đánh dấu OTP đã được xác thực
        otpRecord.verified = true;
        otpRecord.expiresAt = generateOTPExpiry();
        await otpRecord.save();

        return {
            success: true,
            message: "OTP verified successfully. You can now reset your password."
        };
    }

    // Đặt lại mật khẩu mới
    static async resetPassword(email, newPassword) {
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("User not found");

        const verifiedOtpRecord = await OtpModel.findOne({
            email,
            purpose: "forgot_password",
            verified: true,
        }).sort({ updatedAt: -1 });

        if (!verifiedOtpRecord) {
            throw new Error("Please verify OTP first before resetting password.");
        }

        if (new Date() > verifiedOtpRecord.expiresAt) {
            await OtpModel.deleteMany({ email, purpose: "forgot_password" });
            throw new Error("Reset token expired. Please request a new OTP.");
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        // Xóa tất cả OTP quên mật khẩu
        await OtpModel.deleteMany({ email, purpose: "forgot_password" });

        return {
            success: true,
            message: "Password reset successfully. You can now login with your new password."
        };
    }
}






