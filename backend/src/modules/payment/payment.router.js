import { Router } from "express";
import { PayOS } from "@payos/node";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserModel } from "../users/user.model.js";
import { CreditPaymentModel } from "./creditPayment.model.js";
import { addCredits } from "../../utils/credit.util.js";

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
    creditAmount: 5000,
    amount: 19000,
    description: "Gói Starter 5.000 credit",
  },
  {
    id: "pro",
    packageName: "Pro",
    creditAmount: 20000,
    amount: 69000,
    description: "Gói Pro 20.000 credit",
  },
  {
    id: "max",
    packageName: "Max",
    creditAmount: 50000,
    amount: 149000,
    description: "Gói Max 50.000 credit",
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
    const returnUrl = `${BASE_URL}/api/payment/payment-result?orderCode=${orderCode}`;
    const cancelUrl = `${BASE_URL}/api/payment/payment-result?orderCode=${orderCode}&status=cancelled`;

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

    return res.send(`
      <html>
        <head><title>${title}</title></head>
        <body style="font-family:Arial, sans-serif; padding: 24px; color: #0a2463; background:#f4f6fb;">
          <div style="max-width:640px;margin:auto;padding:24px;background:white;border-radius:20px;box-shadow:0 20px 45px rgba(15,23,42,.08);">
            <h1 style="margin-bottom:16px;">${title}</h1>
            <p style="font-size:16px; line-height:1.6;">${message}</p>
            <p style="margin-top:24px;"><a href="/" style="display:inline-block;padding:12px 22px;background:#0a2463;color:white;border-radius:12px;text-decoration:none;">Quay về JobReady</a></p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Payment result page error:", error);
    return res.status(500).send(`<h1>Lỗi server</h1><p>Vui lòng thử lại sau.</p>`);
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
