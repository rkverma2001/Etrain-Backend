const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cart: {
      items: [
        {
          course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
          },
          packageType: {
            type: String,
            enum: ["Bundle", "Exam Voucher", "Practice Test", "Courseware"],
            required: true,
          },
          quantity: { type: Number, default: 1 },
          price: { type: Number, required: true },
          total: { type: Number, required: true },
        },
      ],
      subTotal: { type: Number, required: true },
      tax: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED", "REFUNDED"],
      default: "CREATED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
