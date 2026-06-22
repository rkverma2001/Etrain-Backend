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

          quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
          },

          price: {
            type: Number,
            required: true,
            min: 0,
          },

          total: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],

      subTotal: {
        type: Number,
        required: true,
        min: 0,
      },

      tax: {
        type: Number,
        default: 0,
        min: 0,
      },

      grandTotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: false,
    },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      default: "",
    },

    razorpaySignature: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED", "REFUNDED"],
      default: "CREATED",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
