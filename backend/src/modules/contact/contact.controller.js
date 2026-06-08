import { sendSupportContactEmail } from "../../utils/email.util.js";

/**
 * POST /api/contact
 * Nhận form liên hệ từ frontend và gửi email đến admin
 */
export const sendContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ họ tên, email và nội dung tin nhắn."
            });
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedMessage = message.trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ email không hợp lệ."
            });
        }

        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Họ và tên phải có ít nhất 2 ký tự."
            });
        }

        if (trimmedMessage.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Nội dung tin nhắn phải có ít nhất 10 ký tự."
            });
        }

        const result = await sendSupportContactEmail(trimmedName, trimmedEmail, trimmedMessage);

        if (!result.success && !result.devMode) {
            console.error("Contact email send failed:", result.error);
            // Still return success to user – don't expose internal errors
        }

        return res.status(200).json({
            success: true,
            message: "Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất."
        });
    } catch (error) {
        console.error("❌ Contact controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        });
    }
};
