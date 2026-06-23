import { Router } from "express";
import { PayOS } from "@payos/node";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserModel } from "../users/user.model.js";
import { CreditPaymentModel } from "./creditPayment.model.js";
import { addCredits, PROMO_CODES } from "../../utils/credit.util.js";
import { sendPaymentSuccessEmail } from "../../utils/email.util.js";
import { SystemSettingModel } from "../system/systemSetting.model.js";

const router = Router();

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

const CREDIT_PACKAGES = [
  {
    id: "starter",
    packageName: "Starter",
    creditAmount: 30,
    amount: 29000,
    description: "Gói Starter 30 credit",
  },
  {
    id: "pro",
    packageName: "Pro",
    creditAmount: 90,
    amount: 79000,
    description: "Gói Pro 90 credit",
  },
  {
    id: "max",
    packageName: "Max",
    creditAmount: 170,
    amount: 149000,
    description: "Gói Max 170 credit",
  },
];

function generateOrderCode() {
  return Number(`${Date.now()}${Math.floor(Math.random() * 900 + 100)}`);
}

async function settlePayment(order, paymentData) {
  if (order.credited) {
    return order;
  }

  const status = paymentData?.status ?? order.status;
  if (status === "PAID") {
    await addCredits(order.user, order.creditAmount, UserModel);
    order.status = "PAID";
    order.credited = true;
    order.paidAt = new Date();
    if (paymentData?.amountPaid) {
      order.amountPaid = paymentData.amountPaid;
    }
    await order.save();

    // Gửi email thông báo nạp credit thành công
    try {
      const user = await UserModel.findById(order.user);
      if (user && user.email) {
        await sendPaymentSuccessEmail(
          user.email,
          user.name || "User",
          order.amount,
          order.creditAmount,
          String(order.payosOrderCode)
        );
      }
    } catch (emailErr) {
      console.error("Failed to send payment success email:", emailErr);
    }
  }

  return order;
}

router.post("/create-link", authMiddleware, async (req, res) => {
  try {
    const { packageId } = req.body;
    const selectedPackage = CREDIT_PACKAGES.find((pack) => pack.id === packageId);
    if (!selectedPackage) {
      return res.status(400).json({ message: "Gói credit không hợp lệ" });
    }

    const orderCode = generateOrderCode();
    const reqBaseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const returnUrl = `${reqBaseUrl}/api/payment/payment-result?orderCode=${orderCode}`;
    const cancelUrl = `${reqBaseUrl}/api/payment/payment-result?orderCode=${orderCode}&status=cancelled`;

    const paymentResponse = await payos.paymentRequests.create({
      orderCode,
      amount: selectedPackage.amount,
      description: selectedPackage.description,
      returnUrl,
      cancelUrl,
      buyerName: req.user?.name || "DUONG TRONG LUC",
      buyerEmail: req.user?.email || undefined,
      items: [
        {
          name: selectedPackage.packageName,
          quantity: 1,
          price: selectedPackage.amount,
        },
      ],
    });

    const creditPayment = await CreditPaymentModel.create({
      user: req.user.userId,
      packageId: selectedPackage.id,
      packageName: selectedPackage.packageName,
      creditAmount: selectedPackage.creditAmount,
      amount: selectedPackage.amount,
      payosOrderCode: orderCode,
      payosPaymentLinkId: paymentResponse.paymentLinkId,
      checkoutUrl: paymentResponse.checkoutUrl,
      qrCode: paymentResponse.qrCode,
      status: paymentResponse.status || "PENDING",
    });

    return res.status(201).json({
      orderCode: creditPayment.payosOrderCode,
      checkoutUrl: creditPayment.checkoutUrl,
      qrCode: creditPayment.qrCode,
      status: creditPayment.status,
      amount: creditPayment.amount,
      creditAmount: creditPayment.creditAmount,
      packageName: creditPayment.packageName,
      description: selectedPackage.description,
      buyerName: req.user?.name || 'DUONG TRONG LUC',
    });
  } catch (error) {
    console.error("Create PayOS link error:", error);
    return res.status(500).json({ message: error?.message || "Không thể tạo liên kết thanh toán" });
  }
});

router.get("/details/:orderCode", authMiddleware, async (req, res) => {
  try {
    const orderCode = Number(req.params.orderCode);
    if (!orderCode) {
      return res.status(400).json({ message: "Mã đơn hàng không hợp lệ" });
    }

    const creditPayment = await CreditPaymentModel.findOne({
      payosOrderCode: orderCode,
      user: req.user.userId,
    });
    if (!creditPayment) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Refresh status from PayOS if it is pending
    if (creditPayment.status === "PENDING") {
      try {
        const payosStatus = await payos.paymentRequests.get(orderCode);
        if (payosStatus && payosStatus.status) {
          creditPayment.status = payosStatus.status;
          await creditPayment.save();
          if (payosStatus.status === "PAID" && !creditPayment.credited) {
            await settlePayment(creditPayment, payosStatus);
          }
        }
      } catch (e) {
        console.warn("Unable to refresh PayOS status on details fetch:", e?.message || e);
      }
    }

    return res.status(200).json({
      orderCode: creditPayment.payosOrderCode,
      checkoutUrl: creditPayment.checkoutUrl,
      qrCode: creditPayment.qrCode,
      status: creditPayment.status,
      amount: creditPayment.amount,
      creditAmount: creditPayment.creditAmount,
      packageName: creditPayment.packageName,
      description: creditPayment.packageName ? `Gói ${creditPayment.packageName} ${creditPayment.creditAmount?.toLocaleString()} credit` : `Đơn hàng ${creditPayment.payosOrderCode}`,
      buyerName: req.user?.name || "DUONG TRONG LUC",
    });
  } catch (error) {
    console.error("Get PayOS order details error:", error);
    return res.status(500).json({ message: error?.message || "Không thể lấy chi tiết đơn hàng" });
  }
});

router.get("/verify/:orderCode", authMiddleware, async (req, res) => {
  try {
    const orderCode = Number(req.params.orderCode);
    if (!orderCode) {
      return res.status(400).json({ message: "Mã đơn hàng không hợp lệ" });
    }

    const creditPayment = await CreditPaymentModel.findOne({
      payosOrderCode: orderCode,
      user: req.user.userId,
    });
    if (!creditPayment) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    const payosStatus = await payos.paymentRequests.get(orderCode);
    creditPayment.status = payosStatus.status || creditPayment.status;
    await creditPayment.save();

    if (payosStatus.status === "PAID" && !creditPayment.credited) {
      await settlePayment(creditPayment, payosStatus);
    }

    return res.status(200).json({
      success: creditPayment.status === "PAID",
      status: creditPayment.status,
      creditAmount: creditPayment.creditAmount,
      amount: creditPayment.amount,
      checkoutUrl: creditPayment.checkoutUrl,
      paidAt: creditPayment.paidAt,
    });
  } catch (error) {
    console.error("Verify PayOS order error:", error);
    return res.status(500).json({ message: error?.message || "Không thể xác minh đơn hàng" });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;
    const verified = await payos.webhooks.verify(payload);
    const orderCode = Number(verified.orderCode ?? verified.order_code ?? verified.orderId);

    if (!orderCode) {
      return res.status(400).json({ message: "Webhook không có mã đơn hàng hợp lệ" });
    }

    const creditPayment = await CreditPaymentModel.findOne({ payosOrderCode: orderCode });
    if (!creditPayment) {
      return res.status(404).json({ message: "Đơn hàng PayOS không tìm thấy" });
    }

    if (verified.status) {
      creditPayment.status = verified.status;
    }

    await creditPayment.save();

    if (verified.status === "PAID" && !creditPayment.credited) {
      await settlePayment(creditPayment, verified);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("PayOS webhook error:", error);
    return res.status(400).json({ message: error?.message || "Webhook PayOS không hợp lệ" });
  }
});

router.get("/payment-result", async (req, res) => {
  try {
    const orderCode = Number(req.query.orderCode || req.query.order_code || req.query.code);
    if (!orderCode) {
      return res.status(400).send(`<h1>Thanh toán không hợp lệ</h1><p>Thiếu mã đơn hàng.</p>`);
    }

    const creditPayment = await CreditPaymentModel.findOne({ payosOrderCode: orderCode });
    if (!creditPayment) {
      return res.status(404).send(`<h1>Thanh toán không tìm thấy</h1><p>Không tìm thấy đơn hàng.</p>`);
    }

    try {
      const payosStatus = await payos.paymentRequests.get(orderCode);
      creditPayment.status = payosStatus.status || creditPayment.status;
      await creditPayment.save();
      if (payosStatus.status === "PAID" && !creditPayment.credited) {
        await settlePayment(creditPayment, payosStatus);
      }
    } catch (e) {
      console.warn("Unable to refresh PayOS status for payment-result", e?.message || e);
    }

    const success = creditPayment.status === "PAID";
    const title = success ? "Thanh toán thành công" : "Thanh toán đang xử lý";
    const message = success
      ? `Đơn hàng ${creditPayment.payosOrderCode} đã được thanh toán. Bạn nhận được ${creditPayment.creditAmount.toLocaleString()} credit.`
      : `Đơn hàng ${creditPayment.payosOrderCode} hiện có trạng thái ${creditPayment.status}. Vui lòng kiểm tra lại sau.`;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.send(`
      <html>
        <head><title>${title}</title></head>
        <body style="font-family:Arial, sans-serif; padding: 24px; color: #0a2463; background:#f4f6fb;">
          <div style="max-width:640px;margin:auto;padding:24px;background:white;border-radius:20px;box-shadow:0 20px 45px rgba(15,23,42,.08);">
            <h1 style="margin-bottom:16px;">${title}</h1>
            <p style="font-size:16px; line-height:1.6;">${message}</p>
            <p style="margin-top:24px;"><a href="${frontendUrl}/pricing" style="display:inline-block;padding:12px 22px;background:#0a2463;color:white;border-radius:12px;text-decoration:none;">Quay về bảng giá</a></p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Payment result page error:", error);
    return res.status(500).send(`<h1>Lỗi server</h1><p>Vui lòng thử lại sau.</p>`);
  }
});

router.post("/redeem-promo", authMiddleware, async (req, res) => {
  try {
    const { code, pin } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Vui lòng nhập mã ưu đãi" });
    }

    const cleanCode = code.toUpperCase().trim();
    const promo = PROMO_CODES[cleanCode];
    if (!promo) {
      return res.status(400).json({ message: "Mã ưu đãi không hợp lệ hoặc đã hết hạn" });
    }

    // 1. Kiểm tra cấu hình Đóng/Mở tính năng đổi mã sự kiện toàn hệ thống
    const promoSetting = await SystemSettingModel.findOne({ key: "promo_redemption_enabled" });
    const promoRedemptionEnabled = promoSetting ? promoSetting.value === true : true;
    if (!promoRedemptionEnabled) {
      return res.status(400).json({ message: "Hệ thống đổi mã sự kiện hiện đang đóng. Vui lòng quay lại sau!" });
    }

    // 2. Lấy thông tin user và kiểm tra các giới hạn ưu đãi
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Chặn nhận đúp nếu đăng ký trong ngày sự kiện đã được nhận 150 credits
    if (user.hasReceivedCampaignSignupBonus) {
      return res.status(400).json({ message: "Bạn đã nhận ưu đãi 150 credits khi đăng ký tài khoản trong sự kiện, không thể áp dụng thêm mã quà tặng." });
    }

    if (!user.redeemedCodes) {
      user.redeemedCodes = [];
    }

    // Chỉ được nhận duy nhất một mã ưu đãi sự kiện
    if (user.redeemedCodes.length > 0 || user.redeemedCodes.includes(cleanCode)) {
      return res.status(400).json({ message: "Mỗi tài khoản chỉ được nhận duy nhất một lần ưu đãi sự kiện hoặc mã khuyến mãi." });
    }

    // 3. Xử lý xác thực OTP qua Email (Nếu chưa gửi PIN)
    if (!pin) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const { OtpModel } = await import("../otp/otp.model.js");

      // Xóa các OTP đổi quà cũ để tránh trùng lặp
      await OtpModel.deleteMany({ email: user.email, purpose: "redeem_promo" });

      // Lưu OTP mới
      await OtpModel.create({
        userId: user._id,
        email: user.email,
        code: otpCode,
        purpose: "redeem_promo",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // hiệu lực 10 phút
      });

      // Gửi mail mã xác thực (chạy ngầm)
      const { sendPromoVerificationEmail } = await import("../../utils/email.util.js");
      sendPromoVerificationEmail(user.email, otpCode, user.name, cleanCode)
        .then(() => console.log(`📧 Đã gửi mã xác thực ưu đãi ${cleanCode} (${otpCode}) tới ${user.email}`))
        .catch(err => console.error("Lỗi gửi mail mã xác thực ưu đãi:", err));

      return res.status(200).json({
        requiresPin: true,
        message: "Mã xác thực đã được gửi về email của bạn. Vui lòng kiểm tra và nhập mã PIN để hoàn tất."
      });
    }

    // 4. Xác thực mã OTP do người dùng gửi lên
    const { OtpModel } = await import("../otp/otp.model.js");
    const otpRecord = await OtpModel.findOne({ email: user.email, purpose: "redeem_promo" }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Mã xác thực không tồn tại hoặc yêu cầu đã quá hạn. Vui lòng gửi lại.",
        requiresPin: true
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        message: "Mã xác thực đã hết hạn. Vui lòng gửi lại yêu cầu để nhận mã mới.",
        requiresPin: true
      });
    }

    if (otpRecord.code !== pin.trim()) {
      return res.status(400).json({
        message: "Mã xác thực không chính xác. Vui lòng kiểm tra lại hộp thư email.",
        requiresPin: true
      });
    }

    // Xác thực thành công: Xóa OTP, nạp credit và lưu mã đã dùng
    await OtpModel.deleteMany({ email: user.email, purpose: "redeem_promo" });

    user.credits = (user.credits ?? 60) + promo.credits;
    user.redeemedCodes.push(cleanCode);
    await user.save();

    // Tạo thông báo thành công
    try {
      const { NotificationService } = await import("../notification/notification.service.js");
      await NotificationService.createNotification(
        user._id,
        "Nhận ưu đãi sự kiện thành công",
        `Chúc mừng! Bạn đã nhận thành công +${promo.credits} credits từ mã ưu đãi "${promo.name}".`,
        "system"
      );
    } catch (notiErr) {
      console.error("Promo notification error:", notiErr);
    }

    return res.status(200).json({
      success: true,
      message: `Áp dụng mã thành công! Bạn được cộng +${promo.credits} credits.`,
      credits: user.credits
    });
  } catch (error) {
    console.error("Redeem promo code error:", error);
    return res.status(500).json({ message: "Lỗi server. Không thể áp dụng mã ưu đãi sự kiện." });
  }
});

router.post("/checkin", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (user.lastCheckIn) {
      const lastCheckInDate = new Date(user.lastCheckIn);
      const lastCheckInMidnight = new Date(lastCheckInDate.getFullYear(), lastCheckInDate.getMonth(), lastCheckInDate.getDate()).getTime();

      if (today === lastCheckInMidnight) {
        return res.status(400).json({ message: "Bạn đã điểm danh hôm nay rồi. Hãy quay lại vào ngày mai!" });
      }
    }

    // Cộng 3 credits và cập nhật ngày điểm danh
    user.credits = (user.credits ?? 60) + 3;
    user.lastCheckIn = now;
    await user.save();

    // Tạo thông báo
    try {
      const { NotificationService } = await import("../notification/notification.service.js");
      await NotificationService.createNotification(
        user._id,
        "Điểm danh hàng ngày",
        "Chúc mừng! Bạn nhận được +3 credits cho lượt điểm danh hôm nay.",
        "system"
      );
    } catch (notiErr) {
      console.error("Checkin notification error:", notiErr);
    }

    return res.status(200).json({
      success: true,
      message: "Điểm danh thành công! Bạn được cộng +3 credits.",
      credits: user.credits
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({ message: "Lỗi server. Không thể thực hiện điểm danh." });
  }
});

router.get("/system-settings", async (req, res) => {
  try {
    const campaignSetting = await SystemSettingModel.findOne({ key: "campaign_mode" });
    const campaignMode = campaignSetting ? campaignSetting.value === true : false;

    const promoSetting = await SystemSettingModel.findOne({ key: "promo_redemption_enabled" });
    const promoRedemptionEnabled = promoSetting ? promoSetting.value === true : true;

    return res.status(200).json({ campaignMode, promoRedemptionEnabled });
  } catch (error) {
    console.error("Get system settings error:", error);
    return res.status(500).json({ message: "Không thể lấy cấu hình hệ thống" });
  }
});

router.post("/system-settings", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Bạn không có quyền thay đổi cấu hình này" });
    }

    const { campaignMode, promoRedemptionEnabled } = req.body;

    if (campaignMode !== undefined) {
      await SystemSettingModel.findOneAndUpdate(
        { key: "campaign_mode" },
        { value: !!campaignMode },
        { upsert: true }
      );
    }

    if (promoRedemptionEnabled !== undefined) {
      await SystemSettingModel.findOneAndUpdate(
        { key: "promo_redemption_enabled" },
        { value: !!promoRedemptionEnabled },
        { upsert: true }
      );
    }

    const campaignSetting = await SystemSettingModel.findOne({ key: "campaign_mode" });
    const finalCampaignMode = campaignSetting ? campaignSetting.value === true : false;

    const promoSetting = await SystemSettingModel.findOne({ key: "promo_redemption_enabled" });
    const finalPromoRedemptionEnabled = promoSetting ? promoSetting.value === true : true;

    return res.status(200).json({
      success: true,
      message: "Cập nhật cấu hình hệ thống thành công!",
      campaignMode: finalCampaignMode,
      promoRedemptionEnabled: finalPromoRedemptionEnabled
    });
  } catch (error) {
    console.error("Update system settings error:", error);
    return res.status(500).json({ message: "Không thể cập nhật cấu hình hệ thống" });
  }
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await CreditPaymentModel.find({ user: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ history });
  } catch (error) {
    console.error("Payment history error:", error);
    return res.status(500).json({ message: "Không thể lấy lịch sử nạp credit" });
  }
});

export default router;
