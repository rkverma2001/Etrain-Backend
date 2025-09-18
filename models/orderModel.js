// Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  amount: Number,
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"] },
  paymentMethod: String,
  couponCode: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
