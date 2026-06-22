const Coupon = require("../models/couponModel.js");
const Course = require("../models/courseModel.js");
const { CheckoutError, getCartCheckout } = require("../services/checkoutService");

const create = async (req, res) => {
  try {
    let { applicableCourses, ...rest } = req.body;

    if (applicableCourses && applicableCourses.length > 0) {
      const courses = await Course.find({
        courseCode: { $in: applicableCourses },
      }).select("_id");

      if (!courses.length) {
        return res.status(400).json({ error: "No valid courses found for coupon" });
      }

      applicableCourses = courses.map((course) => course._id);
    }

    const coupon = await Coupon.create({
      ...rest,
      applicableCourses,
    });

    return res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Coupon Create Error:", error);
    return res.status(400).json({ error: error.message });
  }
};

const get = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("applicableCourses");
    return res.status(200).json(coupons);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      "applicableCourses",
    );
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    return res.status(200).json(coupon);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).populate("applicableCourses");

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon" });
    }

    return res.status(200).json(coupon);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    return res.status(200).json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    return res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const apply = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const checkout = await getCartCheckout({
      userId: req.user.id,
      couponCode: code,
    });

    return res.status(200).json({
      message: "Coupon applied successfully",
      coupon: checkout.coupon,
      subtotal: checkout.subtotal,
      discount: checkout.discount,
      tax: checkout.tax,
      grandTotal: checkout.grandTotal,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("Apply Coupon Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create,
  get,
  getById,
  getByCode,
  update,
  remove,
  apply,
};
