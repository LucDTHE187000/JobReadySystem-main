import mongoose from "mongoose";

const creditPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: String,
      required: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    creditAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    payosOrderCode: {
      type: Number,
      required: true,
      unique: true,
    },
    payosPaymentLinkId: {
      type: String,
    },
    checkoutUrl: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED", "FAILED", "PROCESSING"],
      default: "PENDING",
    },
    credited: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const CreditPaymentModel = mongoose.model("CreditPayment", creditPaymentSchema);
