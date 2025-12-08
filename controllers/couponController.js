const Coupon =  require("../models/couponModel.js");
const Course = require("../models/courseModel.js");

const create = async (req, res) => {
  try {
    let { applicableCourses, ...rest } = req.body;

    // If applicableCourses is given as courseCodes → convert to ObjectIds
    if (applicableCourses && applicableCourses.length > 0) {
      const courses = await Course.find({
        courseCode: { $in: applicableCourses },
      }).select("_id");

      if (!courses.length) {
        return res.status(400).json({ error: "No valid courses found for coupon" });
      }

      applicableCourses = courses.map((c) => c._id);
    }

    const coupon = new Coupon({
      ...rest,
      applicableCourses,
    });

    await coupon.save();

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Coupon Create Error:", error);
    res.status(400).json({ error: error.message });
  }
};

const get = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("applicableCourses");
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      "applicableCourses"
    );
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).populate(
      "applicableCourses"
    );

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: "Invalid or expired coupon" });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const apply = async (req, res) => {
  try {
    const { code, orderAmount, courseIds } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).populate("applicableCourses");

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon" });
    }

    // check expiry
    if (coupon.validUntil < Date.now()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // check min purchase
    if (orderAmount < coupon.minPurchaseAmount) {
      return res
        .status(400)
        .json({ message: `Minimum purchase amount is ₹${coupon.minPurchaseAmount}` });
    }

    // check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // 🔹 Convert courseCodes to ObjectIds if needed
    let validCourseIds = [];
    if (courseIds && courseIds.length > 0) {
      const courses = await Course.find({
        $or: [{ _id: { $in: courseIds } }, { courseCode: { $in: courseIds } }],
      }).select("_id");

      validCourseIds = courses.map((c) => c._id.toString());
    }

    // check applicable courses (if set)
    if (coupon.applicableCourses.length > 0 && validCourseIds.length > 0) {
      const isApplicable = validCourseIds.some((courseId) =>
        coupon.applicableCourses.some((c) => c._id.toString() === courseId)
      );

      if (!isApplicable) {
        return res.status(400).json({ message: "Coupon not applicable to selected courses" });
      }
    }

    // calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount > 0) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = orderAmount - discount;

    res.status(200).json({
      message: "Coupon applied successfully",
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Apply Coupon Error:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  create,
  get,
  getById,
  getByCode,
  update,
  remove,
  apply,
};
