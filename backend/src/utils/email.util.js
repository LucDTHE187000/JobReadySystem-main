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
export const sendPromoVerificationEmail = async (to, otp, name = "User", promoName = "GIFT_20") => {
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
                            <p>Bạn đã yêu cầu đổi mã ưu đãi sự kiện <strong>${promoName}</strong> để nhận thêm 20 credits miễn phí.</p>
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
                
                Bạn đã yêu cầu đổi mã ưu đãi sự kiện ${promoName} để nhận thêm 20 credits miễn phí.
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

/**
 * Send Employer Approval email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} companyName - Company name
 * @returns {Promise<Object>} Send result
 */
export const sendEmployerApprovalEmail = async (to, name, companyName) => {
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] Employer Approval Email (Not sent)");
        console.log("=".repeat(60));
        console.log(`To: ${to}`);
        console.log(`Name: ${name}`);
        console.log(`Company Name: ${companyName}`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const mailOptions = {
            from: `JobReady Partner <${sender}>`,
            to: to,
            subject: `[JobReady] Chúc mừng! Tài khoản Nhà tuyển dụng ${companyName} đã được phê duyệt`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #0A2463 0%, #1A3B8B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
                        .welcome-box { background: white; border-left: 4px solid #F5C518; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .button { display: inline-block; background-color: #F5C518; color: #0A2463 !important; text-decoration: none; padding: 12px 25px; font-weight: bold; border-radius: 5px; margin-top: 15px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Chào mừng Đối tác Doanh nghiệp</h1>
                        </div>
                        <div class="content">
                            <h2>Kính chào anh/chị ${name},</h2>
                            <p>Đại diện của <strong>${companyName}</strong>,</p>
                            
                            <p>Chúng tôi rất vui mừng thông báo rằng yêu cầu hợp tác và đăng ký tài khoản Nhà tuyển dụng của quý doanh nghiệp tại hệ thống <strong>JobReady</strong> đã được ban quản trị kiểm duyệt và phê duyệt thành công.</p>
                            
                            <div class="welcome-box">
                                <p><strong>Trạng thái:</strong> Đang hoạt động (Verified Partner)</p>
                                <p><strong>Quyền lợi kích hoạt:</strong></p>
                                <ul>
                                    <li>Được phép đăng tin tuyển dụng không giới hạn trên Jobboard.</li>
                                    <li>Nhận hồ sơ ứng tuyển trực tuyến từ hàng ngàn ứng viên tiềm năng.</li>
                                    <li>Được tặng 200 credits để đăng tin tuyển dụng và trải nghiệm các tính năng cốt lõi.</li>
                                </ul>
                            </div>
                            
                            <p>Quý doanh nghiệp có thể đăng nhập vào hệ thống ngay bây giờ để tiến hành đăng tin tuyển dụng và tìm kiếm nhân sự:</p>
                            
                            <div style="text-align: center;">
                                <a href="https://jobready.com/login" class="button">Đăng nhập JobReady</a>
                            </div>
                            
                            <p style="margin-top: 20px; font-size: 13px; color: #555;">Nếu quý doanh nghiệp có bất kỳ thắc mắc hoặc cần hỗ trợ thêm trong quá trình tuyển dụng, vui lòng phản hồi email này hoặc liên hệ hotline chăm sóc đối tác: 0987-654-321.</p>
                        </div>
                        <div class="footer">
                            <p>Trân trọng,<br><strong>Ban quản trị JobReady System</strong></p>
                            <p>&copy; ${new Date().getFullYear()} JobReady. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);

        if (error) {
            console.error("Resend API error sending approval email:", error);
            return { success: false, error: error.message || JSON.stringify(error) };
        }

        return { success: true, messageId: data.id };
    } catch (err) {
        console.error("Failed to send employer approval email:", err);
        return { success: false, error: err.message };
    }
};

/**
 * Send New Employer Registration support notification email
 * @param {string} email - Recruiter email
 * @param {string} name - Recruiter name
 * @param {string} companyName - Company name
 * @returns {Promise<Object>} Send result
 */
export const sendNewEmployerRegistrationSupportEmail = async (email, name, companyName) => {
    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasResendConfig;
    const supportEmail = "he187000duongtrongluc@gmail.com";

    if (isDevModeOnly) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 [DEV MODE] New Recruiter Registration Notification to Support Email (Not sent)");
        console.log("=".repeat(60));
        console.log(`Support Email: ${supportEmail}`);
        console.log(`Recruiter Email: ${email}`);
        console.log(`Recruiter Name: ${name}`);
        console.log(`Company Name: ${companyName}`);
        console.log("=".repeat(60) + "\n");
        return { success: true, messageId: "dev-mode", devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const mailOptions = {
            from: `JobReady System <${sender}>`,
            to: supportEmail,
            subject: `[JobReady Admin] Thông báo: Yêu cầu đăng ký tài khoản tuyển dụng mới từ ${companyName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #0A2463; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
                        .info-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        .info-table td { padding: 10px; border-bottom: 1px solid #eee; }
                        .info-table td.label { font-weight: bold; width: 180px; color: #555; }
                        .button { display: inline-block; background-color: #F5C518; color: #0A2463 !important; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 4px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 11px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Yêu Cầu Phê Duyệt Nhà Tuyển Dụng Mới</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào Admin,</p>
                            <p>Hệ thống JobReady vừa ghi nhận một tài khoản Nhà tuyển dụng mới đăng ký và xác thực email thành công. Vui lòng kiểm tra và tiến hành đối chiếu thông tin pháp lý (Mã số thuế, Giấy ĐKKD) của doanh nghiệp trước khi phê duyệt hoạt động.</p>
                            
                            <table class="info-table">
                                <tr>
                                    <td class="label">Tên người đại diện:</td>
                                    <td>${name}</td>
                                </tr>
                                <tr>
                                    <td class="label">Email đăng ký:</td>
                                    <td>${email}</td>
                                </tr>
                                <tr>
                                    <td class="label">Tên doanh nghiệp:</td>
                                    <td>${companyName}</td>
                                </tr>
                                <tr>
                                    <td class="label">Mã số thuế / Xác thực:</td>
                                    <td><em>Yêu cầu doanh nghiệp cung cấp qua email hợp tác</em></td>
                                </tr>
                                <tr>
                                    <td class="label">Trạng thái:</td>
                                    <td style="color: #d97706; font-weight: bold;">Chờ kiểm duyệt (0 credits)</td>
                                </tr>
                            </table>
                            
                            <div style="text-align: center;">
                                <a href="https://jobready.com/admin" class="button">Truy cập Trang Quản Trị</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Đây là email thông báo tự động từ hệ thống JobReady. Vui lòng không trả lời trực tiếp email này.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);

        if (error) {
            console.error("Resend API error sending support registration email:", error);
            return { success: false, error: error.message || JSON.stringify(error) };
        }

        return { success: true, messageId: data.id };
    } catch (err) {
        console.error("Failed to send support registration email:", err);
        return { success: false, error: err.message };
    }
};

/**
 * Gửi email thông báo đến nhà tuyển dụng khi có ứng viên nộp hồ sơ
 * @param {Object} opts
 * @param {string} opts.recruiterEmail    - Email nhà tuyển dụng nhận thông báo
 * @param {string} opts.recruiterName     - Tên nhà tuyển dụng / công ty
 * @param {string} opts.jobTitle          - Tên vị trí tuyển dụng
 * @param {string} opts.applicantName     - Tên ứng viên
 * @param {string} opts.applicantEmail    - Email ứng viên
 * @param {string} [opts.agencyCompany]   - Tên công ty agency (nếu job là loại agency)
 * @param {string} [opts.dashboardUrl]    - Link dashboard nhà tuyển dụng
 */
export const sendApplicationNotificationEmail = async ({
    recruiterEmail,
    recruiterName,
    jobTitle,
    applicantName,
    applicantEmail,
    agencyCompany = null,
    dashboardUrl = 'https://jobready.io.vn/dashboard',
}) => {
    if (!recruiterEmail) return { success: false, error: 'No recruiter email' };

    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === 'true' || !hasResendConfig;

    if (isDevModeOnly) {
        console.log('\n' + '='.repeat(60));
        console.log('📧 [DEV MODE] Application Notification Email (Not sent)');
        console.log('='.repeat(60));
        console.log(`To Recruiter: ${recruiterEmail}`);
        console.log(`Job: ${jobTitle}`);
        console.log(`Applicant: ${applicantName} <${applicantEmail}>`);
        if (agencyCompany) console.log(`Agency Company: ${agencyCompany}`);
        console.log('='.repeat(60) + '\n');
        return { success: true, messageId: 'dev-mode', devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const companyLabel = agencyCompany
            ? `<b>${agencyCompany}</b> <span style="color:#6b7280;font-size:12px;">(qua JobReady Agency)</span>`
            : 'hệ thống JobReady';

        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 36px 28px;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 14px;margin-bottom:14px;">
                        <span style="color:#e0e7ff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">📬 Ứng tuyển mới</span>
                    </div>
                    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;line-height:1.3;">Có ứng viên vừa nộp hồ sơ!</h1>
                    <p style="color:#c7d2fe;margin:8px 0 0;font-size:13px;">Thông báo tự động từ hệ thống JobReady</p>
                </div>

                <!-- Body -->
                <div style="padding:32px 36px;">
                    <p style="color:#374151;font-size:15px;margin:0 0 20px;">
                        Xin chào <b>${recruiterName || recruiterEmail}</b>,
                    </p>
                    <p style="color:#374151;font-size:15px;margin:0 0 24px;">
                        Một ứng viên vừa ứng tuyển vào vị trí đăng tại ${companyLabel}.
                    </p>

                    <!-- Info Card -->
                    <div style="background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
                        <table style="width:100%;border-collapse:collapse;">
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;width:150px;">📋 Vị trí ứng tuyển</td>
                                <td style="padding:7px 0;color:#111827;font-weight:700;font-size:14px;">${jobTitle}</td>
                            </tr>
                            ${agencyCompany ? `
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;">🏢 Công ty</td>
                                <td style="padding:7px 0;color:#111827;font-size:14px;">${agencyCompany}</td>
                            </tr>` : ''}
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;">👤 Ứng viên</td>
                                <td style="padding:7px 0;color:#111827;font-size:14px;">${applicantName || 'Không có tên'}</td>
                            </tr>
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;">✉️ Email</td>
                                <td style="padding:7px 0;font-size:14px;"><a href="mailto:${applicantEmail}" style="color:#7c3aed;text-decoration:none;">${applicantEmail || '—'}</a></td>
                            </tr>
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;">🕐 Thời gian</td>
                                <td style="padding:7px 0;color:#111827;font-size:14px;">${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- CTA -->
                    <div style="text-align:center;margin-bottom:28px;">
                        <a href="${dashboardUrl}"
                           style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;
                                  text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                            Xem hồ sơ ứng viên →
                        </a>
                    </div>

                    <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
                        Email này được gửi tự động từ hệ thống JobReady · Vui lòng không trả lời email này.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">
                        © ${new Date().getFullYear()} JobReady System · <a href="https://jobready.io.vn" style="color:#7c3aed;text-decoration:none;">jobready.io.vn</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `JobReady Thông báo <${sender}>`,
            to: recruiterEmail,
            subject: `[JobReady] Ứng viên mới nộp hồ sơ: "${jobTitle}"`,
            html,
            text: `Xin chào ${recruiterName || recruiterEmail},\n\nỨng viên "${applicantName}" (${applicantEmail}) vừa nộp hồ sơ ứng tuyển vị trí "${jobTitle}"${agencyCompany ? ` tại ${agencyCompany}` : ''}.\n\nXem chi tiết tại: ${dashboardUrl}\n\n© ${new Date().getFullYear()} JobReady System.`
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);

        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`📬 Application notification email sent to ${recruiterEmail}. ID: ${data.id}`);
        return { success: true, messageId: data.id };
    } catch (err) {
        console.error(`❌ Failed to send application notification email to ${recruiterEmail}:`, err.message);
        return { success: false, error: err.message };
    }
};

/**
 * Gửi email xác nhận ứng tuyển cho ứng viên (job seeker)
 * @param {Object} opts
 * @param {string} opts.applicantEmail   - Email ứng viên
 * @param {string} opts.applicantName    - Tên ứng viên
 * @param {string} opts.jobTitle         - Tên vị trí ứng tuyển
 * @param {string} [opts.companyName]    - Tên công ty
 * @param {string} [opts.jobLocation]    - Địa điểm làm việc
 * @param {string} [opts.jobType]        - Loại hình công việc
 * @param {string} [opts.jobsUrl]        - Link trang tìm việc để xem thêm
 */
export const sendApplicationConfirmationEmail = async ({
    applicantEmail,
    applicantName,
    jobTitle,
    companyName = 'Nhà tuyển dụng',
    jobLocation = '',
    jobType = '',
    jobsUrl = 'https://jobready.io.vn/jobs',
}) => {
    if (!applicantEmail) return { success: false, error: 'No applicant email' };

    const hasResendConfig = !!process.env.RESEND_API_KEY;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === 'true' || !hasResendConfig;

    if (isDevModeOnly) {
        console.log('\n' + '='.repeat(60));
        console.log('📧 [DEV MODE] Application Confirmation Email (Not sent)');
        console.log('='.repeat(60));
        console.log(`To Applicant: ${applicantEmail}`);
        console.log(`Job: ${jobTitle} @ ${companyName}`);
        console.log('='.repeat(60) + '\n');
        return { success: true, messageId: 'dev-mode', devMode: true };
    }

    try {
        const resendInstance = getResendInstance();
        const sender = getSender();

        const locationText = jobLocation ? `<tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;width:150px;">📍 Địa điểm</td>
                                <td style="padding:7px 0;color:#111827;font-size:14px;">${jobLocation}</td>
                            </tr>` : '';

        const jobTypeText = jobType ? `<tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;">⏱️ Hình thức</td>
                                <td style="padding:7px 0;color:#111827;font-size:14px;">${jobType === 'full-time' ? 'Toàn thời gian' : jobType === 'part-time' ? 'Bán thời gian' : jobType === 'remote' ? 'Làm từ xa' : jobType === 'internship' ? 'Thực tập' : jobType}</td>
                            </tr>` : '';

        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#0A2463 0%,#1e40af 100%);padding:36px 36px 28px;">
                    <div style="display:inline-block;background:rgba(245,197,24,0.2);border:1px solid rgba(245,197,24,0.4);border-radius:8px;padding:6px 14px;margin-bottom:14px;">
                        <span style="color:#F5C518;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">✅ Ứng tuyển thành công</span>
                    </div>
                    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;line-height:1.3;">Hồ sơ đã được gửi đi!</h1>
                    <p style="color:#93c5fd;margin:8px 0 0;font-size:13px;">Thông báo xác nhận từ hệ thống JobReady</p>
                </div>

                <!-- Body -->
                <div style="padding:32px 36px;">
                    <p style="color:#374151;font-size:15px;margin:0 0 8px;">
                        Xin chào <b>${applicantName || 'bạn'}</b> 👋
                    </p>
                    <p style="color:#374151;font-size:15px;margin:0 0 24px;">
                        JobReady xác nhận hồ sơ của bạn đã được gửi thành công! Nhà tuyển dụng sẽ xem xét và liên hệ với bạn trong thời gian sớm nhất.
                    </p>

                    <!-- Job Info Card -->
                    <div style="background:#eff6ff;border-left:4px solid #0A2463;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                        <p style="color:#0A2463;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Chi tiết vị trí ứng tuyển</p>
                        <table style="width:100%;border-collapse:collapse;">
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;width:150px;">💼 Vị trí</td>
                                <td style="padding:7px 0;color:#111827;font-weight:700;font-size:14px;">${jobTitle}</td>
                            </tr>
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;">🏢 Công ty</td>
                                <td style="padding:7px 0;color:#111827;font-size:14px;">${companyName}</td>
                            </tr>
                            ${locationText}
                            ${jobTypeText}
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;">📅 Ngày nộp</td>
                                <td style="padding:7px 0;color:#111827;font-size:14px;">${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })}</td>
                            </tr>
                            <tr>
                                <td style="padding:7px 0;color:#6b7280;font-size:13px;">📌 Trạng thái</td>
                                <td style="padding:7px 0;font-size:14px;"><span style="background:#dbeafe;color:#1e40af;font-weight:700;padding:2px 10px;border-radius:20px;font-size:12px;">Đang xem xét</span></td>
                            </tr>
                        </table>
                    </div>

                    <!-- What's next -->
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 20px;margin-bottom:28px;">
                        <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 10px;">📋 Các bước tiếp theo</p>
                        <ol style="color:#166534;font-size:13px;margin:0;padding-left:18px;line-height:1.8;">
                            <li>Nhà tuyển dụng sẽ xem xét hồ sơ của bạn</li>
                            <li>Nếu phù hợp, bạn sẽ nhận được lời mời phỏng vấn</li>
                            <li>Theo dõi trạng thái hồ sơ tại mục <b>"Đơn ứng tuyển"</b> trên JobReady</li>
                        </ol>
                    </div>

                    <!-- CTA -->
                    <div style="text-align:center;margin-bottom:28px;">
                        <a href="${jobsUrl}"
                           style="display:inline-block;background:linear-gradient(135deg,#0A2463,#1e40af);color:#fff;
                                  text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                            Khám phá thêm việc làm →
                        </a>
                    </div>

                    <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
                        Email này được gửi tự động từ hệ thống JobReady · Vui lòng không trả lời email này.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">
                        © ${new Date().getFullYear()} JobReady System ·
                        <a href="https://jobready.io.vn" style="color:#0A2463;text-decoration:none;">jobready.io.vn</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `JobReady <${sender}>`,
            to: applicantEmail,
            subject: `[JobReady] Hồ sơ ứng tuyển "${jobTitle}" tại ${companyName} đã được gửi!`,
            html,
            text: `Xin chào ${applicantName},\n\nHồ sơ ứng tuyển của bạn cho vị trí "${jobTitle}" tại ${companyName} đã được gửi thành công vào lúc ${new Date().toLocaleString('vi-VN')}.\n\nNhà tuyển dụng sẽ xem xét và liên hệ với bạn trong thời gian sớm nhất.\n\nKhám phá thêm việc làm tại: ${jobsUrl}\n\n© ${new Date().getFullYear()} JobReady System.`
        };

        const { data, error } = await resendInstance.emails.send(mailOptions);

        if (error) {
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log(`📬 Application confirmation email sent to ${applicantEmail}. ID: ${data.id}`);
        return { success: true, messageId: data.id };
    } catch (err) {
        console.error(`❌ Failed to send application confirmation email to ${applicantEmail}:`, err.message);
        return { success: false, error: err.message };
    }
};
