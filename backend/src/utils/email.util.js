import nodemailer from "nodemailer";

const createTransporter = () => {
    const emailConfig = {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        throw new Error("Email credentials (EMAIL_USER and EMAIL_PASS) are required to send emails. Please configure them in your .env file.");
    }

    return nodemailer.createTransporter(emailConfig);
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
    const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    // Only use dev mode if explicitly set OR if no email config is available
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasEmailConfig;

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
        const transporter = createTransporter();

        const mailOptions = {
            from: `"JobSeeker System" <${process.env.EMAIL_USER || "noreply@jobseekersystem.com"}>`,
            to: to,
            subject: "Verify Your Email - JobSeeker System",
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
                            <h1>JobSeeker System</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>Thank you for registering with JobSeeker System. Please verify your email address by entering the OTP code below:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            
                            <p>This code will expire in <strong>10 minutes</strong>.</p>
                            <p>If you didn't create an account, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} JobSeeker System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Hello ${name}!
                
                Thank you for registering with JobSeeker System. Please verify your email address by entering the OTP code below:
                
                ${otp}
                
                This code will expire in 10 minutes.
                
                If you didn't create an account, please ignore this email.
                
                © ${new Date().getFullYear()} JobSeeker System. All rights reserved.
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Error sending OTP email:", error.message);
        console.log("\n" + "=".repeat(60));
        console.log("⚠️  Email không gửi được, nhưng OTP đã được tạo:");
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
    const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    const isDevModeOnly = process.env.EMAIL_DEV_MODE === "true" || !hasEmailConfig;

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
        const transporter = createTransporter();

        const mailOptions = {
            from: `"JobSeeker System" <${process.env.EMAIL_USER || "noreply@jobseekersystem.com"}>`,
            to: to,
            subject: "Reset Your Password - JobSeeker System",
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
                            <h1>JobSeeker System</h1>
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
                            <p>&copy; ${new Date().getFullYear()} JobSeeker System. All rights reserved.</p>
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
                
                © ${new Date().getFullYear()} JobSeeker System. All rights reserved.
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Reset password OTP email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
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






