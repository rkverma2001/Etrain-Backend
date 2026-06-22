const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },

    // Example:
    // percentage → 20 means 20%
    // flat → 500 means ₹500 off
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },

    // Used only for percentage coupons
    // Example: max ₹2000 discount cap
    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Minimum cart value required
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    validFrom: {
      type: Date,
      default: Date.now,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    // 0 = unlimited usage
    usageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Empty array = applicable to all courses
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

/*
Auto-disable expired coupons
*/
couponSchema.pre("save", function (next) {
  if (this.validUntil && this.validUntil < new Date()) {
    this.isActive = false;
  }

  /*
  Safety check:
  usageLimit exceeded
  */
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    this.isActive = false;
  }

  next();
});

module.exports = mongoose.model("Coupon", couponSchema);
