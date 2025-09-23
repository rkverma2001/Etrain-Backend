import mongoose from "mongoose";

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
      enum: ["percentage", "flat"], // % discount or flat discount
      required: true,
    },
    discountValue: {
      type: Number,
      required: true, // e.g. 20 for 20% or 500 for flat ₹500
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // for % coupons: max cap
    },
    minPurchaseAmount: {
      type: Number,
      default: 0, // minimum order value required
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

couponSchema.pre("save", function (next) {
  if (this.validUntil && this.validUntil < Date.now()) {
    this.isActive = false;
  }
  next();
});

export default mongoose.model("Coupon", couponSchema);
