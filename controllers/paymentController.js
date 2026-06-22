const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const Bill = require("../models/billModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
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

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      couponCode,
      currency = "INR",
      receipt,
      meta = {},
    } = req.body;

    const checkout = await getCartCheckout({ userId, couponCode });
    const amountInPaise = Math.round(checkout.grandTotal * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    });

    const { order, bill } = await createPendingOrder({
      userId,
      checkout,
      paymentMethod: "Online",
      razorpayOrderId: razorpayOrder.id,
    });

    const payment = await Payment.create({
      user: userId,
      order: order._id,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: "created",
      method: "Online",
      meta: {
        name: meta.name || "",
        email: meta.email || "",
        mobile: meta.mobile || "",
        state: meta.state || "",
        city: meta.city || "",
      },
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("cart.items.course")
      .populate("bill")
      .populate("coupon");

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      razorpayOrder,
      order: populatedOrder,
      bill,
      payment,
      totals: {
        subtotal: checkout.subtotal,
        discount: checkout.discount,
        tax: checkout.tax,
        grandTotal: checkout.grandTotal,
      },
    });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    console.error("Create Payment Order Error:", err);
    return res.status(500).json({
      error: err.message || "Could not create payment order",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    console.log("========== VERIFY PAYMENT ==========");
    console.log("USER:", req.user);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      meta = {},
    } = req.body;

    console.log("BODY:", req.body);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Generated Signature:", generatedSignature);
    console.log("Razorpay Signature:", razorpay_signature);

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      user: req.user.id,
    });

    console.log("Payment Found:", payment);

    if (!payment) {
      return res.status(404).json({
        error: "Payment record not found",
      });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user.id,
    });

    console.log("Order Found:", order);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    const bill = await Bill.findById(order.bill);

    if (generatedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();

      order.status = "FAILED";
      await order.save();

      if (bill) {
        bill.paymentStatus = "Failed";
        await bill.save();
      }

      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }

    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "paid";
    payment.method = meta.method || payment.method || "Online";
    await payment.save();

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = "PAID";
    await order.save();

    if (bill) {
      bill.paymentStatus = "Paid";
      bill.paymentMethod = meta.method || "Online";
      bill.transactionId = razorpay_payment_id;
      await bill.save();
    }

    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, { $inc: { usedCount: 1 } });
    }

    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

    const user = await User.findById(order.user);
    const customerEmail = user?.email || payment.meta?.email;

    if (customerEmail && emailService) {
      try {
        const populatedOrder = await Order.findById(order._id).populate(
          "cart.items.course",
        );
        const populatedBill = bill
          ? await Bill.findById(bill._id).populate("items.course")
          : null;
        const emailUser = {
          ...(user ? user.toObject() : {}),
          email: customerEmail,
        };
        await emailService.sendPaymentSuccessEmail(emailUser, populatedOrder, populatedBill, {
          paymentId: razorpay_payment_id,
          method: meta.method || "Online",
        });
        await emailService.sendBillEmail(emailUser, populatedBill, populatedOrder);
      } catch (emailError) {
        console.error("Error sending payment emails:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
    });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    return res.status(500).json({
      error: err.message || "Verification failed",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
