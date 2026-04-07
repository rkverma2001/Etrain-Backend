const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const Bill = require("../models/billModel");
const User = require("../models/userModel");

// Email service - optional
let emailService;
try {
  emailService = require("../services/emailService");
} catch (e) {
  console.warn("Email service not available:", e.message);
  emailService = null;
}

require("dotenv").config();


// init razorpay using env vars
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// POST /api/payment/create-order
const createOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = "INR",
      receipt = undefined,
      meta = {},
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const options = {
      amount: Math.round(amount), // pass paise from frontend or compute here
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, // automatic capture (1) or manual (0)
    };

    const order = await razorpay.orders.create(options);

    // Save minimal payment record
    const payment = new Payment({
      user: req.user?.id || undefined, // if you have auth middleware fill user id
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      meta,
    });

    await payment.save();

    return res.json({ order });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ error: "Could not create order" });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, meta } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate signature on server and compare
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const isValid = generated_signature === razorpay_signature;

    const payment = await Payment.findOne({ orderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    if (isValid) {
      payment.paymentId = razorpay_payment_id;
      payment.signature = razorpay_signature;
      payment.status = "paid";
      payment.method = meta?.method || payment.method;
      if (meta) payment.meta = { ...payment.meta, ...meta };
      await payment.save();

      // Update order and bill
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id })
        .populate("cart.items.course")
        .populate("bill");
      
      if (order) {
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = "PAID";
        await order.save();

        const bill = await Bill.findById(order.bill).populate("items.course");
        if (bill) {
          bill.paymentStatus = "Paid";
          bill.transactionId = razorpay_payment_id;
          await bill.save();
        }

        // Send payment success email with bill
        const user = await User.findById(order.user);
        if (user && user.email && emailService) {
          try {
            // Send payment success email
            await emailService.sendPaymentSuccessEmail(user, order, bill, {
              paymentId: razorpay_payment_id,
              method: meta?.method || "Online",
            });

            // Send bill email
            await emailService.sendBillEmail(user, bill, order);
          } catch (emailError) {
            console.error("Error sending emails:", emailError);
          }
        }
      }

      return res.json({ ok: true, message: "Payment verified and saved" });
    } else {
      payment.status = "failed";
      await payment.save();

      // Update order and bill to failed
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (order) {
        order.status = "FAILED";
        await order.save();

        const bill = await Bill.findById(order.bill);
        if (bill) {
          bill.paymentStatus = "Failed";
          await bill.save();
        }

        // Send payment failed email
        const user = await User.findById(order.user);
        if (user && user.email && emailService) {
          try {
            await emailService.sendPaymentFailedEmail(user, order);
          } catch (emailError) {
            console.error("Error sending payment failed email:", emailError);
          }
        }
      }

      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
