import { UserModel } from "../users/user.model.js";
import { OtpModel } from "../otp/otp.model.js";
import { generateTokenFromUser } from "../../utils/jwt.util.js";
import { generateOTP, generateOTPExpiry } from "../../utils/otp.util.js";
import { sendOTPEmail, sendResetPasswordEmail } from "../../utils/email.util.js";
import { OAuth2Client } from "google-auth-library";
import { DEFAULT_CREDITS, PROMO_CODES } from "../../utils/credit.util.js";

export class AuthService {
    // Đăng ký tài khoản mới
    static async register(userData) {
        const { email, password, name, role, promoCode, referralCode } = userData;

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

        // Đọc Campaign Mode để gán credit mặc định
        let defaultSignupCredits = DEFAULT_CREDITS;
        let hasReceivedCampaignSignupBonus = false;
        try {
            const { SystemSettingModel } = await import("../system/systemSetting.model.js");
            const campaignSetting = await SystemSettingModel.findOne({ key: "campaign_mode" });
            if (campaignSetting && campaignSetting.value === true) {
                defaultSignupCredits = 150; // 60 + 90
                hasReceivedCampaignSignupBonus = true;
            }
        } catch (err) {
            console.error("Failed to read campaign setting in registration:", err);
        }

        // Kiểm tra và áp dụng mã giới thiệu bạn bè
        let referredByUser = null;
        if (referralCode) {
            referredByUser = await UserModel.findOne({ referralCode: referralCode.toUpperCase().trim() });
            if (!referredByUser) {
                throw new Error("Mã giới thiệu không tồn tại hoặc không hợp lệ");
            }
        }

        // Kiểm tra và áp dụng mã khuyến mãi sự kiện nếu có
        let initialCredits = defaultSignupCredits;
        const redeemedCodes = [];
        if (promoCode) {
            const cleanCode = promoCode.toUpperCase().trim();
            const promo = PROMO_CODES[cleanCode];
            if (!promo) {
                throw new Error("Mã ưu đãi không hợp lệ");
            }
            // Không cộng dồn nếu đã nhận 150 credits từ Campaign Mode
            if (!hasReceivedCampaignSignupBonus) {
                initialCredits += promo.credits;
            }
            redeemedCodes.push(cleanCode);
        }

        // Tạo tài khoản mới - Cần xác thực email qua OTP
        let user;
        try {
            user = await UserModel.create({
                email: normalizedEmail,
                password,
                name: normalizedName,
                role: role || "JOB_SEEKER",
                isVerified: false,
                credits: initialCredits,
                hasReceivedCampaignSignupBonus,
                redeemedCodes: redeemedCodes,
                referredBy: referredByUser ? referredByUser._id : undefined
            });
        } catch (error) {
            if (error.code === 11000 || error.message.includes("duplicate")) {
                throw new Error("Email already registered");
            }
            throw error;
        }

        // Tạo mã OTP xác thực email
        const otpCode = generateOTP();
        const otpExpires = generateOTPExpiry();

        await OtpModel.create({
            userId: user._id,
            email: normalizedEmail,
            code: otpCode,
            purpose: "verify_email",
            expiresAt: otpExpires,
        });

        // Gửi email chứa mã OTP (chạy ngầm không block request)
        sendOTPEmail(normalizedEmail, otpCode, normalizedName)
            .then(emailResult => {
                if (!emailResult.success) {
                    console.warn(`⚠️ Email không gửi được tới ${normalizedEmail}, nhưng OTP đã được tạo. Code: ${otpCode}`);
                } else {
                    console.log(`📧 Đã gửi OTP thành công tới ${normalizedEmail}. Code: ${otpCode}`);
                }
            })
            .catch(err => {
                console.error(`❌ Lỗi gửi email tới ${normalizedEmail}:`, err);
            });

        // Tạo thông báo chào mừng
        try {
            const { NotificationService } = await import("../notification/notification.service.js");
            await NotificationService.createNotification(
                user._id,
                "Chào mừng đến với JobReady System",
                "Chúc mừng bạn đã tạo tài khoản thành công! Hãy cập nhật hồ sơ cá nhân để có trải nghiệm tốt nhất.",
                "system"
            );
        } catch (notiErr) {
            console.error("Welcome notification creation failed:", notiErr);
        }

        return {
            message: "Đăng ký thành công. Vui lòng xác thực mã OTP gửi về email của bạn.",
            userId: user._id,
            email: user.email,
            needsVerification: true
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
        if (!user.isVerified) {
            user.isVerified = true;

            // Xử lý thưởng giới thiệu (Referral bonus)
            if (user.referredBy && !user.referralBonusProcessed) {
                user.credits = (user.credits ?? 60) + 10; // Người được giới thiệu nhận +10
                user.referralBonusProcessed = true;

                try {
                    const referrer = await UserModel.findById(user.referredBy);
                    if (referrer) {
                        referrer.credits = (referrer.credits ?? 60) + 15; // Người giới thiệu nhận +15
                        await referrer.save();

                        // Gửi thông báo cho người giới thiệu
                        const { NotificationService } = await import("../notification/notification.service.js");
                        await NotificationService.createNotification(
                            referrer._id,
                            "Nhận credit từ giới thiệu bạn bè",
                            `Chúc mừng! Bạn đã nhận được +15 credits vì giới thiệu thành công ứng viên ${user.name}.`,
                            "system"
                        );
                    }
                } catch (refErr) {
                    console.error("Failed to reward referrer on OTP verify:", refErr);
                }
            }
        }
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

        // Gửi email chứa mã OTP mới (chạy ngầm không block request)
        sendOTPEmail(email, otpCode, user.name)
            .then(emailResult => {
                if (!emailResult.success) {
                    console.warn(`⚠️ Email không gửi được tới ${email}, nhưng OTP đã được tạo. Code: ${otpCode}`);
                } else {
                    console.log(`📧 Đã gửi OTP mới thành công tới ${email}. Code: ${otpCode}`);
                }
            })
            .catch(err => {
                console.error(`❌ Lỗi gửi email tới ${email}:`, err);
            });

        return { message: "New OTP sent successfully. Please check your email." };
    }

    // Đăng nhập
    static async login(credentials) {
        const { email, password, otp } = credentials;
        const user = await UserModel.findOne({ email });
        if (!user) throw new Error("Invalid credentials");

        // Kiểm tra xem tài khoản có mật khẩu hay không (trường hợp đăng ký bằng Google)
        if (!user.password && user.googleId) {
            throw new Error("GoogleAccountLocalLoginAttempt");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) throw new Error("Invalid credentials");

        if (!user.isVerified) {
            if (!otp) {
                throw new Error("Email not verified. Please verify your email first.");
            }

            // Lấy OTP trong bảng OtpModel
            const otpRecord = await OtpModel.findOne({ email }).sort({ createdAt: -1 });
            if (!otpRecord) throw new Error("OTP not found. Please request a new OTP.");

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
        }

        if (user.isActive === false) {
            throw new Error("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
        }

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
                credits: user.credits ?? DEFAULT_CREDITS,
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

        // Gửi email reset password (chạy ngầm không block request)
        sendResetPasswordEmail(email, otpCode, user.name)
            .then(emailResult => {
                if (!emailResult.success) {
                    console.warn(`⚠️ Email không gửi được tới ${email}, nhưng OTP đã được tạo. Code: ${otpCode}`);
                } else {
                    console.log(`📧 Đã gửi reset password OTP thành công tới ${email}. Code: ${otpCode}`);
                }
            })
            .catch(err => {
                console.error(`❌ Lỗi gửi email tới ${email}:`, err);
            });

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

    // Đăng nhập bằng Google
    static async googleLogin(googleLoginData) {
        const { token, role, referralCode, promoCode } = googleLoginData;
        if (!token) {
            throw new Error("Google ID Token is required");
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error("GOOGLE_CLIENT_ID is not configured in backend env");
        }

        const client = new OAuth2Client(clientId);
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: clientId,
            });
        } catch (error) {
            console.error("Error verifying Google token:", error);
            throw new Error("Xác thực token Google thất bại");
        }

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error("Không lấy được thông tin từ Google token");
        }

        const { sub: googleId, email, name, picture: avatarUrl } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Tìm user theo googleId hoặc email
        let user = await UserModel.findOne({
            $or: [{ googleId }, { email: normalizedEmail }]
        });

        if (user) {
            // Nếu tìm thấy user bằng email nhưng chưa liên kết googleId
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                if (!user.isVerified) {
                    user.isVerified = true; // Google email đã xác thực
                }
                if (!user.avatarUrl && avatarUrl) {
                    user.avatarUrl = avatarUrl;
                }
                await user.save();
            }
        } else {
            // 2. Tạo user mới
            // Map role được truyền từ client (JOB_SEEKER hoặc EMPLOYER)
            const userRole = (role === "EMPLOYER" || role === "ADMIN") ? role : "JOB_SEEKER";

            // Đọc Campaign Mode để gán credit mặc định
            let defaultSignupCredits = DEFAULT_CREDITS;
            let hasReceivedCampaignSignupBonus = false;
            try {
                const { SystemSettingModel } = await import("../system/systemSetting.model.js");
                const campaignSetting = await SystemSettingModel.findOne({ key: "campaign_mode" });
                if (campaignSetting && campaignSetting.value === true) {
                    defaultSignupCredits = 150; // 60 + 90
                    hasReceivedCampaignSignupBonus = true;
                }
            } catch (err) {
                console.error("Failed to read campaign setting in googleLogin:", err);
            }

            let initialCredits = userRole === "JOB_SEEKER" ? defaultSignupCredits : 0;
            const redeemedCodes = [];
            
            // Áp dụng promoCode sự kiện nếu có
            if (promoCode && userRole === "JOB_SEEKER") {
                const cleanCode = promoCode.toUpperCase().trim();
                const promo = PROMO_CODES[cleanCode];
                if (promo) {
                    if (!hasReceivedCampaignSignupBonus) {
                        initialCredits += promo.credits;
                    }
                    redeemedCodes.push(cleanCode);
                }
            }

            // Áp dụng referralCode giới thiệu nếu có
            let referredBy = undefined;
            let referralBonusProcessed = false;
            if (referralCode && userRole === "JOB_SEEKER") {
                const referrer = await UserModel.findOne({ referralCode: referralCode.toUpperCase().trim() });
                if (referrer) {
                    referredBy = referrer._id;
                    referralBonusProcessed = true;
                    // Cộng thưởng giới thiệu ngay lập tức vì Google login tự động verified
                    initialCredits += 10; // Người được giới thiệu nhận +10
                    
                    // Người giới thiệu nhận +15
                    referrer.credits = (referrer.credits ?? 60) + 15;
                    await referrer.save();

                    // Gửi thông báo cho người giới thiệu
                    try {
                        const { NotificationService } = await import("../notification/notification.service.js");
                        await NotificationService.createNotification(
                            referrer._id,
                            "Nhận credit từ giới thiệu bạn bè",
                            `Chúc mừng! Bạn đã nhận được +15 credits vì giới thiệu thành công ứng viên qua Google.`,
                            "system"
                        );
                    } catch (notiErr) {
                        console.error("Referral notification failed in googleLogin:", notiErr);
                    }
                }
            }

            user = await UserModel.create({
                email: normalizedEmail,
                name: name || "Google User",
                googleId,
                authProvider: "google",
                isVerified: true,
                role: userRole,
                avatarUrl: avatarUrl || "",
                credits: initialCredits,
                hasReceivedCampaignSignupBonus,
                redeemedCodes: redeemedCodes,
                referredBy: referredBy,
                referralBonusProcessed: referralBonusProcessed
            });

            // Tạo thông báo chào mừng
            try {
                const { NotificationService } = await import("../notification/notification.service.js");
                await NotificationService.createNotification(
                    user._id,
                    "Chào mừng đến với JobReady System",
                    "Chúc mừng bạn đã tạo tài khoản thành công qua Google! Hãy cập nhật hồ sơ cá nhân để có trải nghiệm tốt nhất.",
                    "system"
                );
            } catch (notiErr) {
                console.error("Welcome notification creation failed:", notiErr);
            }
        }

        if (user.isActive === false) {
            throw new Error("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
        }

        const jwtToken = generateTokenFromUser(user);
        return {
            token: jwtToken,
            user: {
                id: user._id,
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                language: user.language,
                credits: user.credits ?? DEFAULT_CREDITS,
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
}






