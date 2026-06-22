const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional for guest checkout
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },

    // Razorpay Order ID
    orderId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // Razorpay Payment ID (after successful payment)
    paymentId: {
      type: String,
      trim: true,
      default: "",
    },

    // Razorpay Signature
    signature: {
      type: String,
      trim: true,
      default: "",
    },

    // Amount stored in paise (smallest currency unit)
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },

    // Example: UPI, Card, Net Banking, Wallet, Online
    method: {
      type: String,
      default: "Online",
      trim: true,
    },

    // Extra metadata for billing + tracking
    meta: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },

      mobile: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
