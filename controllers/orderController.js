const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Bill = require("../models/billModel");
const User = require("../models/userModel");
const Razorpay = require("razorpay");

// Email service - optional
let emailService;
try {
  emailService = require("../services/emailService");
} catch (e) {
  console.warn("Email service not available:", e.message);
  emailService = null;
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const create = async (req, res) => {
  try {
    const userId = req.user.id; // assuming JWT auth middleware
    const { couponCode, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: userId }).populate("items.course");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const subtotal = cart.items.reduce((acc, item) => acc + item.total, 0);
    let discount = 0;
    let coupon;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validUntil: { $gte: new Date() },
      });
      if (!coupon) {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }
      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.discountValue) / 100;
        if (
          coupon.maxDiscountAmount > 0 &&
          discount > coupon.maxDiscountAmount
        ) {
          discount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === "flat") {
        discount = coupon.discountValue;
      }
      if (subtotal < coupon.minPurchaseAmount) {
        return res.status(400).json({
          message: `Coupon valid only for minimum purchase of ₹${coupon.minPurchaseAmount}`,
        });
      }
    }
    const tax = Math.round((subtotal - discount) * 0.18);
    const grandTotal = subtotal - discount + tax;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: grandTotal * 100, // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    });

    const bill = await Bill.create({
      user: userId,
      items: cart.items.map((i) => ({
        course: i.course._id,
        quantity: i.quantity,
        price: i.price,
        total: i.total,
      })),
      subtotal,
      discount,
      tax,
      grandTotal,
      paymentMethod,
      paymentStatus: "Pending",
      transactionId: razorpayOrder.id,
    });

    const order = await Order.create({
      user: userId,
      cart: {
        items: cart.items,
        subTotal: subtotal,
        tax,
        grandTotal,
      },
      bill: bill._id,
      coupon: coupon ? coupon._id : null,
      razorpayOrderId: razorpayOrder.id,
      status: "CREATED",
    });

    // Populate for email
    const populatedOrder = await Order.findById(order._id)
      .populate("cart.items.course")
      .populate("bill");

    const populatedBill = await Bill.findById(bill._id).populate("items.course");

    // Send order confirmation email
    const user = await User.findById(userId);
    if (user && user.email && emailService) {
      try {
        await emailService.sendOrderConfirmationEmail(user, populatedOrder, populatedBill);
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
      }
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
      bill: populatedBill,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const get = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate("cart.items.course")
      .populate("bill")
      .populate("coupon");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { create, get };

const getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.course")
      .populate("bill")
      .populate("coupon");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  create,
  get,
  getById,
};
