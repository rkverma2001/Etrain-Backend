const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Bill = require("../models/billModel");
const Order = require("../models/orderModel");

const TAX_RATE = 0.18;
const PACKAGE_TYPES = ["Bundle", "Exam Voucher", "Practice Test", "Courseware"];

class CheckoutError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "CheckoutError";
    this.statusCode = statusCode;
  }
}

const normalizeQuantity = (quantity) => {
  const value = Number(quantity);
  if (!Number.isInteger(value) || value < 1) {
    throw new CheckoutError("Quantity must be a positive integer");
  }
  return value;
};

const getCoursePackage = (course, packageType) => {
  if (!PACKAGE_TYPES.includes(packageType)) {
    throw new CheckoutError("Invalid package type");
  }

  const packageData = course?.tabData?.[packageType];
  if (!packageData) {
    throw new CheckoutError("Selected package not found for this course");
  }

  const price = Number(packageData.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new CheckoutError("Selected package price is invalid");
  }

  return { packageData, price };
};

const calculateDiscount = (coupon, subtotal) => {
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  }

  if (coupon.discountType === "flat") {
    discount = coupon.discountValue;
  }

  return Math.min(Math.round(discount), subtotal);
};

const validateCoupon = async ({ couponCode, subtotal, items }) => {
  if (!couponCode) return { coupon: null, discount: 0 };

  const coupon = await Coupon.findOne({
    code: String(couponCode).trim().toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new CheckoutError("Invalid or expired coupon");
  }

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    throw new CheckoutError("Coupon is not active yet");
  }

  if (coupon.validUntil && coupon.validUntil < now) {
    throw new CheckoutError("Coupon has expired");
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new CheckoutError("Coupon usage limit reached");
  }

  if (subtotal < coupon.minPurchaseAmount) {
    throw new CheckoutError(
      `Coupon valid only for minimum purchase of Rs ${coupon.minPurchaseAmount}`,
    );
  }

  if (coupon.applicableCourses.length > 0) {
    const courseIds = items.map((item) => item.course.toString());
    const isApplicable = coupon.applicableCourses.some((courseId) =>
      courseIds.includes(courseId.toString()),
    );

    if (!isApplicable) {
      throw new CheckoutError("Coupon not applicable to selected courses");
    }
  }

  return {
    coupon,
    discount: calculateDiscount(coupon, subtotal),
  };
};

const getCartCheckout = async ({ userId, couponCode }) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.course");

  if (!cart || cart.items.length === 0) {
    throw new CheckoutError("Cart is empty");
  }

  const items = cart.items.map((item) => {
    if (!item.course) {
      throw new CheckoutError(
        "Cart contains an unavailable course. Please update your cart.",
      );
    }

    const quantity = normalizeQuantity(item.quantity);
    const { price } = getCoursePackage(item.course, item.packageType);

    return {
      course: item.course._id,
      packageType: item.packageType,
      quantity,
      price,
      total: price * quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const { coupon, discount } = await validateCoupon({
    couponCode,
    subtotal,
    items,
  });
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * TAX_RATE);
  const grandTotal = taxableAmount + tax;

  return {
    cart,
    coupon,
    items,
    subtotal,
    discount,
    tax,
    grandTotal,
  };
};

const createPendingOrder = async ({
  userId,
  checkout,
  paymentMethod = "Online",
  razorpayOrderId,
}) => {
  const bill = await Bill.create({
    user: userId,
    items: checkout.items,
    subtotal: checkout.subtotal,
    discount: checkout.discount,
    tax: checkout.tax,
    grandTotal: checkout.grandTotal,
    paymentMethod,
    paymentStatus: "Pending",
    transactionId: razorpayOrderId || "",
    invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  });

  const order = await Order.create({
    user: userId,
    cart: {
      items: checkout.items,
      subTotal: checkout.subtotal,
      tax: checkout.tax,
      grandTotal: checkout.grandTotal,
    },
    bill: bill._id,
    coupon: checkout.coupon ? checkout.coupon._id : null,
    razorpayOrderId,
    status: "CREATED",
  });

  return { order, bill };
};

module.exports = {
  CheckoutError,
  PACKAGE_TYPES,
  getCoursePackage,
  getCartCheckout,
  createPendingOrder,
};
