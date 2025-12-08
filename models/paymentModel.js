const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    }, // optional if not logged in
    orderId: { type: String, required: true }, // razorpay order id
    paymentId: { type: String, required: false }, // razorpay payment id (filled after success)
    signature: { type: String, required: false },
    amount: { type: Number, required: true }, // amount in smallest currency unit (e.g. paise)
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    method: { type: String }, // e.g. "card", "upi"
    meta: { type: Object }, // store extra info like name/email/state/city
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
