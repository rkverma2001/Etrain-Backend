const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "cash"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
