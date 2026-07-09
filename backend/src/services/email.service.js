import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Gửi email thông báo đến nhà tuyển dụng khi có ứng viên nộp hồ sơ
 * @param {Object} options
 * @param {string} options.recruiterEmail    - Email nhà tuyển dụng nhận thông báo
 * @param {string} options.recruiterName     - Tên nhà tuyển dụng
 * @param {string} options.jobTitle          - Tên vị trí ứng tuyển
 * @param {string} options.applicantName     - Tên ứng viên
 * @param {string} options.applicantEmail    - Email ứng viên
 * @param {string} [options.agencyCompany]   - Tên công ty agency (nếu có)
 * @param {string} [options.dashboardUrl]    - Link đến dashboard nhà tuyển dụng
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
    if (!recruiterEmail) return;

    const companyLabel = agencyCompany
        ? `<b>${agencyCompany}</b> (qua JobReady Agency)`
        : 'hệ thống JobReady';

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 36px;">
            <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">📬 Có ứng viên mới nộp hồ sơ!</h1>
            <p style="color: #c7d2fe; margin: 6px 0 0; font-size: 14px;">Thông báo từ hệ thống JobReady</p>
        </div>

        <!-- Body -->
        <div style="background: #fff; padding: 32px 36px;">
            <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">
                Xin chào <b>${recruiterName || recruiterEmail}</b>,
            </p>
            <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
                Một ứng viên vừa nộp hồ sơ ứng tuyển qua ${companyLabel}. 
                Chi tiết như sau:
            </p>

            <!-- Info Card -->
            <div style="background: #f0f4ff; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 140px;">📋 Vị trí ứng tuyển:</td>
                        <td style="padding: 6px 0; color: #111827; font-weight: 600; font-size: 14px;">${jobTitle}</td>
                    </tr>
                    ${agencyCompany ? `
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">🏢 Công ty:</td>
                        <td style="padding: 6px 0; color: #111827; font-size: 14px;">${agencyCompany}</td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">👤 Ứng viên:</td>
                        <td style="padding: 6px 0; color: #111827; font-size: 14px;">${applicantName || 'Không có tên'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">✉️ Email ứng viên:</td>
                        <td style="padding: 6px 0; color: #4f46e5; font-size: 14px;">${applicantEmail || '—'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">🕐 Thời gian:</td>
                        <td style="padding: 6px 0; color: #111827; font-size: 14px;">${new Date().toLocaleString('vi-VN')}</td>
                    </tr>
                </table>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-bottom: 24px;">
                <a href="${dashboardUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; 
                          text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                    Xem hồ sơ ứng viên →
                </a>
            </div>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Email này được gửi tự động từ hệ thống JobReady. Vui lòng không trả lời email này.
            </p>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"JobReady Thông báo" <${process.env.EMAIL_USER}>`,
            to: recruiterEmail,
            subject: `[JobReady] Ứng viên mới nộp hồ sơ: "${jobTitle}"`,
            html,
        });
        console.log(`✅ Application notification email sent to ${recruiterEmail}`);
    } catch (err) {
        console.error(`❌ Failed to send email to ${recruiterEmail}:`, err.message);
    }
};
