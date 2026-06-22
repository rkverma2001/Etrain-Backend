const Order = require("../models/orderModel");
const Bill = require("../models/billModel");
const User = require("../models/userModel");
const {
  CheckoutError,
  getCartCheckout,
  createPendingOrder,
} = require("../services/checkoutService");

let emailService;
try {
  emailService = require("../services/emailService");
} catch (e) {
  console.warn("Email service not available:", e.message);
  emailService = null;
}

const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode, paymentMethod = "Online" } = req.body;

    const checkout = await getCartCheckout({ userId, couponCode });
    const { order, bill } = await createPendingOrder({
      userId,
      checkout,
      paymentMethod,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("cart.items.course")
      .populate("bill")
      .populate("coupon");

    const populatedBill = await Bill.findById(bill._id).populate("items.course");

    const user = await User.findById(userId);
    if (user && user.email && emailService) {
      try {
        await emailService.sendOrderConfirmationEmail(
          user,
          populatedOrder,
          populatedBill,
        );
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
      }
    }

    return res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
      bill: populatedBill,
      totals: {
        subtotal: checkout.subtotal,
        discount: checkout.discount,
        tax: checkout.tax,
        grandTotal: checkout.grandTotal,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("Create Order Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const get = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("cart.items.course")
      .populate("bill")
      .populate("coupon");

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate("cart.items.course")
      .populate("bill")
      .populate("coupon");

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  create,
  get,
  getById,
};
