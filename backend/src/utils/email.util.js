import { Resend } from "resend";

const getResendInstance = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("Resend API key (RESEND_API_KEY) is required. Please configure it in your environment / .env file.");
    }
    return new Resend(apiKey);
};

const getSender = () => {
    return process.env.RESEND_SENDER || "onboarding@resend.dev";
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - Recipient name (optional)
 * @returns {Promise<Object>} Send result
 */
export const sendOTPEmail = async (to, otp, name = "User") => {
    // Check if email credentials are configured
    const hasResendConfig = !!process.env.RESEND_API_KEY;

    // Only use dev mode if explicitly set OR if no email config is available
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] OTP Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${to}`);
        console.log(`Name: ${name}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const mailOptions = {
            from: `JobReady <${sender}>`,
            to: to,
            subject: "Verify Your Email - JobReady System",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>JobReady System</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>Thank you for registering with JobReady System. Please verify your email address by entering the OTP code below:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            
                            <p>This code will expire in <strong>10 minutes</strong>.</p>
                            <p>If you didn't create an account, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} JobReady System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Hello ${name}!
                
                Thank you for registering with JobReady System. Please verify your email address by entering the OTP code below:
                
                ${otp}
                
                This code will expire in 10 minutes.
                
                If you didn't create an account, please ignore this email.
                
                © ${new Date().getFullYear()} JobReady System. All rights reserved.
            `
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);
        
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending OTP email:", error.message);
        console.log("\n" + "=".repeat(60));
        console.log("⚠️  Email không gửi được qua Resend, nhưng OTP đã được tạo:");
        console.log(`📧 Email: ${to}`);
        console.log(`🔑 OTP Code: ${otp}`);
        console.log("=".repeat(60) + "\n");

        return { success: false, messageId: null, error: error.message };
    }
};

/**
 * Send promo verification OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - Recipient name
 * @param {string} promoName - Promo code name
 * @returns {Promise<Object>} Send result
 */
export const sendPromoVerificationEmail = async (to, otp, name = "User", promoName = "GIFT_79") => {
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Promo Verification OTP Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${to}`);
        console.log(`Name: ${name}`);
        console.log(`Promo Name: ${promoName}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const mailOptions = {
            from: `JobReady <${sender}>`,
            to: to,
            subject: `[JobReady] Mã xác thực nhận ưu đãi ${promoName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #0A2463 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px dashed #0A2463; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #0A2463; letter-spacing: 5px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>JobReady System</h1>
                        </div>
                        <div class="content">
                            <h2>Xin chào ${name}!</h2>
                            <p>Bạn đã yêu cầu đổi mã ưu đãi sự kiện <strong>${promoName}</strong> để nhận thêm 90 credits miễn phí.</p>
                            <p>Vui lòng nhập mã xác thực OTP dưới đây vào trang sự kiện để hoàn tất:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            
                            <p>Mã xác thực này có hiệu lực trong vòng <strong>10 phút</strong>.</p>
                            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} JobReady System. Tất cả các quyền được bảo lưu.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Xin chào ${name}!
                
                Bạn đã yêu cầu đổi mã ưu đãi sự kiện ${promoName} để nhận thêm 90 credits miễn phí.
                Vui lòng nhập mã xác thực OTP dưới đây vào trang sự kiện để hoàn tất:
                
                ${otp}
                
                Mã xác thực này có hiệu lực trong vòng 10 phút.
                
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                
                © ${new Date().getFullYear()} JobReady System. Tất cả các quyền được bảo lưu.
            `
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);
        
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending promo verification email:", error.message);
        console.log("\n" + "=".repeat(60));
        console.log("⚠️  Email không gửi được qua Resend, nhưng OTP đã được tạo:");
        console.log(`📧 Email: ${to}`);
        console.log(`🔑 OTP Code: ${otp}`);
        console.log("=".repeat(60) + "\n");

        return { success: false, messageId: null, error: error.message };
    }
};

/**
 * Send reset password OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - Recipient name (optional)
 * @returns {Promise<Object>} Send result
 */
export const sendResetPasswordEmail = async (to, otp, name = "User") => {
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Reset Password OTP Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${to}`);
        console.log(`Name: ${name}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const mailOptions = {
            from: `JobReady <${sender}>`,
            to: to,
            subject: "Reset Your Password - JobReady System",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>JobReady System</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>You have requested to reset your password. Please use the OTP code below to verify your identity:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong> This code will expire in <strong>10 minutes</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                            </div>
                            
                            <p>After verifying the OTP, you will be able to set a new password for your account.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} JobReady System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Hello ${name}!
                
                You have requested to reset your password. Please use the OTP code below to verify your identity:
                
                ${otp}
                
                This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                
                After verifying the OTP, you will be able to set a new password for your account.
                
                © ${new Date().getFullYear()} JobReady System. All rights reserved.
            `
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);
        
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log("Reset password OTP email sent:", data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending reset password OTP email:", error.message);
        console.log("\n" + "=".repeat(60));
        console.log("⚠️  Email không gửi được, nhưng OTP đã được tạo:");
        console.log(`📧 Email: ${to}`);
        console.log(`🔑 OTP Code: ${otp}`);
        console.log("=".repeat(60) + "\n");

        return { success: false, messageId: null, error: error.message };
    }
};

/**
 * Send support/contact form email to admin inbox
 * @param {string} senderName - Name of person submitting the form
 * @param {string} senderEmail - Email of person submitting the form
 * @param {string} messageBody - Message content
 * @returns {Promise<Object>} Send result
 */
export const sendSupportContactEmail = async (senderName, senderEmail, messageBody) => {
    const adminEmail = process.env.EMAIL_USER || process.env.RESEND_SENDER;
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Support Contact Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${adminEmail}`);
        console.log(`From: ${senderName} <${senderEmail}>`);
        console.log(`Message: ${messageBody}`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
                    .wrapper { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                    .header { background: linear-gradient(135deg, #0A2463 0%, #1e40af 100%); color: white; padding: 32px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
                    .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.8; }
                    .badge { display: inline-block; background: rgba(245,197,24,0.2); border: 1px solid rgba(245,197,24,0.5); color: #F5C518; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
                    .content { padding: 30px; }
                    .field { margin-bottom: 20px; }
                    .field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 6px; }
                    .field-value { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #111827; }
                    .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #F5C518; border-radius: 8px; padding: 16px; font-size: 14px; color: #111827; white-space: pre-wrap; line-height: 1.7; }
                    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
                    .reply-hint { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 13px; color: #1d4ed8; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="header">
                        <div class="badge">📩 Liên hệ mới</div>
                        <h1>JobReady – Tin nhắn hỗ trợ</h1>
                        <p>Bạn nhận được một tin nhắn từ form liên hệ trên website</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="field-label">Họ và tên</div>
                            <div class="field-value">${senderName}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Email người gửi</div>
                            <div class="field-value">${senderEmail}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Nội dung tin nhắn</div>
                            <div class="message-box">${messageBody}</div>
                        </div>
                        <div class="reply-hint">
                            💡 Để trả lời, hãy gửi email trực tiếp đến: <strong>${senderEmail}</strong>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} JobReady System · Gửi lúc ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} (ICT)</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `JobReady Contact <${sender}>`,
            to: adminEmail,
            reply_to: senderEmail,
            subject: `[JobReady Liên Hệ] Tin nhắn từ ${senderName}`,
            html,
            text: `Tin nhắn từ: ${senderName} <${senderEmail}>\n\n${messageBody}\n\n---\nGửi qua form liên hệ JobReady`
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);

        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`📬 Contact email from ${senderEmail} forwarded to admin. ID: ${data.id}`);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending support contact email:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send contact email from Recruiter to Candidate
 * @param {string} to - Candidate email
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {string} recruiterName - Recruiter name
 * @returns {Promise<Object>} Send result
 */
export const sendContactEmail = async (to, subject, body, recruiterName = "Recruiter") => {
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Recruiter Contact Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${to}`);
        console.log(`From: ${recruiterName}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const mailOptions = {
            from: `"${recruiterName} (via JobReady)" <${sender}>`,
            to: to,
            reply_to: sender,
            subject: subject,
            text: body,
            html: body.replace(/\n/g, '<br/>')
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);
        
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending contact email:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send payment success email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {number} amountPaid - Paid amount in VND
 * @param {number} creditsAdded - Added credits
 * @param {string} orderCode - PayOS Order Code
 * @returns {Promise<Object>} Send result
 */
export const sendPaymentSuccessEmail = async (to, name, amountPaid, creditsAdded, orderCode) => {
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Payment Success Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${to}`);
        console.log(`Name: ${name}`);
        console.log(`Order Code: ${orderCode}`);
        console.log(`Amount: ${amountPaid.toLocaleString("vi-VN")} VND`);
        console.log(`Credits Added: ${creditsAdded.toLocaleString("vi-VN")}`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6fb; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 30px auto; padding: 0; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
                    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
                    .content { padding: 40px; }
                    .greeting { font-size: 18px; font-weight: bold; color: #111827; margin-bottom: 20px; }
                    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
                    .info-row:last-child { margin-bottom: 0; border-top: 1px solid #e5e7eb; padding-top: 12px; font-weight: bold; }
                    .info-label { color: #6b7280; }
                    .info-value { color: #111827; text-align: right; }
                    .btn-container { text-align: center; margin-top: 30px; }
                    .btn { display: inline-block; background-color: #10B981; color: white !important; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 15px; transition: background-color 0.2s; }
                    .btn:hover { background-color: #059669; }
                    .footer { text-align: center; padding: 25px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Giao dịch thành công</h1>
                        <p>Cảm ơn bạn đã đồng hành cùng JobReady!</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Xin chào ${name},</div>
                        <p>Chúng tôi xin xác nhận rằng thanh toán của bạn cho đơn hàng <strong>#${orderCode}</strong> đã được thực hiện thành công. Tài khoản của bạn đã được cộng thêm credit tương ứng để tiếp tục trải nghiệm các tính năng AI xịn xò.</p>
                        
                        <div class="info-box">
                            <div class="info-row">
                                <span class="info-label">Mã đơn hàng:</span>
                                <span class="info-value">#${orderCode}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Sản phẩm:</span>
                                <span class="info-value">Nạp credit JobReady</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Số tiền thanh toán:</span>
                                <span class="info-value">${amountPaid.toLocaleString("vi-VN")} VND</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Số credit được cộng:</span>
                                <span class="info-value" style="color: #10B981; font-weight: bold;">+${creditsAdded.toLocaleString("vi-VN")} Credit</span>
                            </div>
                        </div>
                        
                        <p>Bây giờ bạn đã có thể bắt đầu sử dụng các tính năng như <strong>Chấm điểm CV bằng AI</strong>, <strong>Luyện tập Phỏng vấn AI</strong> và nhiều tính năng khác.</p>
                        
                        <div class="btn-container">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Trải nghiệm ngay</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} JobReady System. Tất cả các quyền được bảo lưu.</p>
                        <p>Email này được gửi tự động, vui lòng không phản hồi trực tiếp.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `JobReady <${sender}>`,
            to: to,
            subject: `[JobReady] Nạp credit thành công - Đơn hàng #${orderCode}`,
            html,
            text: `Xin chào ${name},\n\nChúng tôi xác nhận đơn hàng #${orderCode} đã thanh toán thành công.\nSố tiền: ${amountPaid.toLocaleString("vi-VN")} VND.\nSố credit đã cộng: +${creditsAdded.toLocaleString("vi-VN")} Credit.\n\nCảm ơn bạn đã tin dùng JobReady!\nJobReady System.`
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);
        
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`📬 Payment success email sent to ${to}. ID: ${data.id}`);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending payment success email:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send feedback confirmation email to the user
 * @param {string} toEmail - Recipient email
 * @param {string} userName - Recipient name
 * @param {Object} feedbackDetails - { type, subject, message, rating, checkedOptions }
 * @returns {Promise<Object>} Send result
 */
export const sendFeedbackConfirmationEmail = async (toEmail, userName, feedbackDetails) => {
    const { type, subject, message, rating, checkedOptions } = feedbackDetails;
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Feedback Confirmation Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${toEmail}`);
        console.log(`User: ${userName}`);
        console.log(`Type: ${type}`);
        console.log(`Subject: ${subject}`);
        console.log(`Rating: ${rating || 'N/A'}`);
        console.log(`Checked options: ${checkedOptions ? checkedOptions.join(', ') : 'None'}`);
        console.log(`Message: ${message}`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const optionsHtml = (checkedOptions && checkedOptions.length > 0)
            ? `<div style="margin: 15px 0; padding: 12px; background: #f0f4f8; border-radius: 8px;">
                <strong>Chi tiết đã chọn:</strong>
                <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                    ${checkedOptions.map(o => `<li>${o}</li>`).join('')}
                </ul>
               </div>`
            : '';

        const ratingHtml = rating 
            ? `<p><strong>Đánh giá của bạn:</strong> ${rating} / 5 ⭐</p>`
            : '';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6fb; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 30px auto; padding: 0; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
                    .header { background: linear-gradient(135deg, #0A2463 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 26px; font-weight: bold; }
                    .content { padding: 40px; }
                    .greeting { font-size: 18px; font-weight: bold; color: #111827; margin-bottom: 20px; }
                    .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #F5C518; border-radius: 8px; padding: 16px; font-size: 14px; color: #111827; margin: 20px 0; white-space: pre-wrap; }
                    .footer { text-align: center; padding: 25px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Cảm ơn phản hồi của bạn</h1>
                    </div>
                    <div class="content">
                        <div class="greeting">Xin chào ${userName},</div>
                        <p>JobReady đã nhận được phản hồi loại <strong>${type}</strong> của bạn với tiêu đề: <strong>${subject}</strong>.</p>
                        
                        ${ratingHtml}
                        ${optionsHtml}
                        
                        <p><strong>Nội dung ý kiến bạn đã gửi:</strong></p>
                        <div class="message-box">${message}</div>
                        
                        <p>Chúng tôi luôn lắng nghe ý kiến đóng góp từ người dùng để không ngừng nâng cao chất lượng dịch vụ. Đội ngũ kỹ thuật của JobReady sẽ xem xét phản hồi này trong thời gian sớm nhất.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} JobReady System. Tất cả các quyền được bảo lưu.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `JobReady <${sender}>`,
            to: toEmail,
            subject: `[JobReady] Xác nhận đã nhận phản hồi của bạn - ${type}`,
            html
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`📬 Feedback confirmation email sent to ${toEmail}. ID: ${data.id}`);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending feedback confirmation email:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send feedback notification email to Admin inbox
 * @param {string} userEmail - Submitter email
 * @param {string} userName - Submitter name
 * @param {Object} feedbackDetails - { type, subject, message, rating, checkedOptions }
 * @returns {Promise<Object>} Send result
 */
export const sendAdminFeedbackNotificationEmail = async (userEmail, userName, feedbackDetails) => {
    const adminEmail = process.env.EMAIL_USER || process.env.RESEND_SENDER;
    const { type, subject, message, rating, checkedOptions } = feedbackDetails;
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Admin Feedback Notification Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${adminEmail}`);
        console.log(`Submitter: ${userName} <${userEmail}>`);
        console.log(`Type: ${type}`);
        console.log(`Subject: ${subject}`);
        console.log(`Rating: ${rating || 'N/A'}`);
        console.log(`Checked options: ${checkedOptions ? checkedOptions.join(', ') : 'None'}`);
        console.log(`Message: ${message}`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const optionsHtml = (checkedOptions && checkedOptions.length > 0)
            ? `<div style="margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 6px;">Vấn đề / Góp ý đã chọn</div>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px;">
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #111827;">
                        ${checkedOptions.map(o => `<li>${o}</li>`).join('')}
                    </ul>
                </div>
               </div>`
            : '';

        const ratingHtml = rating 
            ? `<div style="margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 6px;">Đánh giá</div>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #111827;">
                    ${rating} / 5 ⭐
                </div>
               </div>`
            : '';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
                    .wrapper { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                    .header { background: linear-gradient(135deg, #0A2463 0%, #1e40af 100%); color: white; padding: 32px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
                    .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.8; }
                    .badge { display: inline-block; background: rgba(245,197,24,0.2); border: 1px solid rgba(245,197,24,0.5); color: #F5C518; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
                    .content { padding: 30px; }
                    .field { margin-bottom: 20px; }
                    .field-label { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 6px; }
                    .field-value { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #111827; }
                    .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #F5C518; border-radius: 8px; padding: 16px; font-size: 14px; color: #111827; white-space: pre-wrap; line-height: 1.7; }
                    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="header">
                        <div class="badge">📢 Feedback Mới (${type})</div>
                        <h1>JobReady – Thông báo Feedback</h1>
                        <p>Hệ thống vừa nhận được phản hồi mới từ người dùng</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="field-label">Người gửi</div>
                            <div class="field-value">${userName} (${userEmail})</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Tiêu đề</div>
                            <div class="field-value">${subject}</div>
                        </div>
                        ${ratingHtml}
                        ${optionsHtml}
                        <div class="field">
                            <div class="field-label">Nội dung chi tiết</div>
                            <div class="message-box">${message}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} JobReady System. Tất cả các quyền được bảo lưu.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `JobReady <${sender}>`,
            to: adminEmail,
            subject: `[JobReady-Admin] Feedback mới từ người dùng - ${type}`,
            html
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`📬 Admin feedback notification email sent to ${adminEmail}. ID: ${data.id}`);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending admin feedback notification email:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome email to a new user
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {boolean} isReferred - Whether the user registered via referral code
 * @returns {Promise<Object>} Send result
 */
export const sendWelcomeEmail = async (to, name = "User", isReferred = false) => {
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Welcome Email (Not sent - Development mode)");
        console.log("=".repeat(60));
        console.log(`To: ${to}`);
        console.log(`Name: ${name}`);
        console.log(`Is Referred: ${isReferred}`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const referralHtml = isReferred
            ? `<div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0; font-size: 15px; color: #065f46; font-weight: bold;">🎉 Chúc mừng! Áp dụng mã giới thiệu thành công</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #047857;">Tài khoản của bạn đã được cộng thêm <strong>10 credits</strong> miễn phí.</p>
               </div>`
            : '';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6fb; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 30px auto; padding: 0; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
                    .content { padding: 40px; }
                    .greeting { font-size: 18px; font-weight: bold; color: #111827; margin-bottom: 20px; }
                    .highlight-text { font-size: 15px; line-height: 1.8; color: #374151; }
                    .btn-container { text-align: center; margin-top: 30px; }
                    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
                    .footer { text-align: center; padding: 25px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Chào mừng bạn đến với JobReady! 🎉</h1>
                        <p>Hành trình bứt phá sự nghiệp bắt đầu từ đây</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Xin chào ${name},</div>
                        <div class="highlight-text">
                            <p>Cảm ơn bạn đã quan tâm và lựa chọn JobReady để luyện tập phỏng vấn giữa hàng ngàn lựa chọn ngoài kia. Chúng tôi rất vinh hạnh được đồng hành cùng bạn trên con đường chinh phục nhà tuyển dụng!</p>
                            
                            ${referralHtml}
                            
                            <p>Với JobReady, bạn có thể dễ dàng:</p>
                            <ul style="padding-left: 20px; color: #4b5563;">
                                <li style="margin-bottom: 8px;"><strong>Chấm điểm CV bằng AI:</strong> Xem ngay điểm ATS và nhận đề xuất sửa đổi tối ưu.</li>
                                <li style="margin-bottom: 8px;"><strong>Luyện phỏng vấn thử:</strong> Phòng phỏng vấn giả lập AI sinh câu hỏi bám sát chuyên ngành và chấm điểm, sửa câu trả lời chi tiết.</li>
                                <li style="margin-bottom: 8px;"><strong>Học tập & Tìm việc:</strong> Nâng cấp kiến thức và kết nối trực tiếp với các tin đăng tuyển chính thức.</li>
                            </ul>
                            
                            <p>Chúc bạn có trải nghiệm tuyệt vời nhất cùng JobReady!</p>
                            <p style="margin-top: 25px; color: #4b5563; line-height: 1.5;">Trân trọng,<br/><strong>Đội ngũ JobReady</strong></p>
                        </div>
                        
                        <div class="btn-container">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Bắt đầu Trải nghiệm</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} JobReady System. Tất cả các quyền được bảo lưu.</p>
                        <p>Đây là email tự động, vui lòng không phản hồi thư này.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `JobReady <${sender}>`,
            to: to,
            subject: "Chào mừng bạn đến với JobReady! 🎉",
            html,
            text: `Xin chào ${name},\n\nChào mừng bạn đến với JobReady!\nCảm ơn bạn đã quan tâm và lựa chọn JobReady để luyện tập phỏng vấn giữa hàng ngàn lựa chọn ngoài kia. Chúc bạn có trải nghiệm tốt nhất trên hành trình sự nghiệp.\n\n${isReferred ? 'Chúc mừng bạn đã áp dụng mã giới thiệu thành công và nhận thêm 10 credits miễn phí.' : ''}\n\nTrân trọng,\nĐội ngũ JobReady`
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);
        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`📬 Welcome email sent to ${to}. ID: ${data.id}`);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error("❌ Error sending welcome email:", error.message);
        return { success: false, error: error.message };
    }
};
