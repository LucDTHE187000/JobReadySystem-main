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
