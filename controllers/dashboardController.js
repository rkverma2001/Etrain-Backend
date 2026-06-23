const User = require("../models/userModel");
const Order = require("../models/orderModel");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "name email mobile city state userType createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const orders = await Order.find({
      user: userId,
    })
      .populate("cart.items.course")
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;

    const paidOrders = orders.filter(
      (order) => order.status === "PAID"
    ).length;

    const totalSpent = orders
      .filter((order) => order.status === "PAID")
      .reduce(
        (sum, order) => sum + (order.cart?.grandTotal || 0),
        0
      );

    const purchasedCourses = [];

    orders.forEach((order) => {
      order.cart.items.forEach((item) => {
        purchasedCourses.push({
          courseId: item.course?._id,
          courseName:
            item.course?.courseName ||
            item.course?.title ||
            "Course",
          packageType: item.packageType,
          quantity: item.quantity,
          amount: item.total,
          orderId: order._id,
          orderStatus: order.status,
          purchaseDate: order.createdAt,
        });
      });
    });

    res.status(200).json({
      success: true,

      user,

      stats: {
        totalOrders,
        paidOrders,
        totalSpent,
      },

      recentOrders: orders.slice(0, 5),

      purchasedCourses,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};