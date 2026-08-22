const Order = require("../models/orderModel");

const getCombinedData = async (req, res) => {
  try {
    const {
      userId,
      courseId,
      courseCode,
      packageType,
      status,
      paymentMethod,
      couponCode,
      invoiceNumber,
      orderNumber,
      razorpayOrderId,
      startDate,
      endDate,
      search,
    } = req.query;

    // ---------------------------------------
    // 1. BUILD ORDER FILTER
    // ---------------------------------------

    const orderFilter = {};

    if (userId) {
      orderFilter.user = userId;
    }

    if (status) {
      orderFilter.status = status;
    }

    if (razorpayOrderId) {
      orderFilter.razorpayOrderId = razorpayOrderId;
    }

    // ---------------------------------------
    // DATE FILTER
    // ---------------------------------------

    if (startDate || endDate) {
      orderFilter.createdAt = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        orderFilter.createdAt.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        orderFilter.createdAt.$lte = end;
      }
    }

    // ---------------------------------------
    // 2. GET ORDERS
    // ---------------------------------------

    const orders = await Order.find(orderFilter)
      .populate({
        path: "user",
        select: "name email mobile userType city state",
      })
      .populate({
        path: "bill",
        select:
          "invoiceNumber orderNumber billDate paymentStatus paymentMethod transactionId subtotal tax discount grandTotal",
      })
      .populate({
        path: "coupon",
        select: "code discount discountType",
      })
      .populate({
        path: "cart.items.course",
        select: "courseCode courseName",
      })
      .sort({ createdAt: -1 })
      .lean();

    // ---------------------------------------
    // 3. COMBINED RESULT
    // ---------------------------------------

    const result = [];

    for (const order of orders) {
      // -------------------------------------
      // BILL FILTERS
      // -------------------------------------

      if (invoiceNumber) {
        if (
          !order.bill ||
          order.bill.invoiceNumber?.toLowerCase() !==
            invoiceNumber.toLowerCase()
        ) {
          continue;
        }
      }

      if (orderNumber) {
        if (
          !order.bill ||
          String(order.bill.orderNumber) !==
            String(orderNumber)
        ) {
          continue;
        }
      }

      // -------------------------------------
      // PAYMENT METHOD FILTER
      // -------------------------------------

      if (paymentMethod) {
        if (
          !order.bill ||
          order.bill.paymentMethod !== paymentMethod
        ) {
          continue;
        }
      }

      // -------------------------------------
      // COUPON CODE FILTER
      // -------------------------------------

      if (couponCode) {
        if (
          !order.coupon ||
          order.coupon.code?.toLowerCase() !==
            couponCode.trim().toLowerCase()
        ) {
          continue;
        }
      }

      // -------------------------------------
      // GET ITEMS
      // -------------------------------------

      if (!order.cart?.items?.length) {
        continue;
      }

      let items = order.cart.items;

      // -------------------------------------
      // COURSE ID FILTER
      // -------------------------------------

      if (courseId) {
        items = items.filter(
          (item) =>
            item.course &&
            String(item.course._id) ===
              String(courseId)
        );
      }

      // -------------------------------------
      // COURSE CODE FILTER
      // -------------------------------------

      if (courseCode) {
        items = items.filter(
          (item) =>
            item.course?.courseCode
              ?.toLowerCase() ===
            courseCode.trim().toLowerCase()
        );
      }

      // -------------------------------------
      // PACKAGE TYPE FILTER
      // -------------------------------------

      if (packageType) {
        items = items.filter(
          (item) =>
            item.packageType === packageType
        );
      }

      // -------------------------------------
      // SEARCH
      // -------------------------------------

      if (search) {
        const searchText =
          search.trim().toLowerCase();

        const userName =
          order.user?.name?.toLowerCase() || "";

        const userEmail =
          order.user?.email?.toLowerCase() || "";

        const userMobile =
          order.user?.mobile?.toLowerCase() || "";

        const coupon =
          order.coupon?.code?.toLowerCase() || "";

        const invoice =
          order.bill?.invoiceNumber?.toLowerCase() ||
          "";

        const razorpayOrder =
          order.razorpayOrderId?.toLowerCase() || "";

        const razorpayPayment =
          order.razorpayPaymentId?.toLowerCase() || "";

        const orderNo = String(
          order.bill?.orderNumber || ""
        ).toLowerCase();

        const userMatches =
          userName.includes(searchText) ||
          userEmail.includes(searchText) ||
          userMobile.includes(searchText);

        const billMatches =
          coupon.includes(searchText) ||
          invoice.includes(searchText) ||
          razorpayOrder.includes(searchText) ||
          razorpayPayment.includes(searchText) ||
          orderNo.includes(searchText);

        items = items.filter((item) => {
          const courseName =
            item.course?.courseName?.toLowerCase() ||
            "";

          const code =
            item.course?.courseCode?.toLowerCase() ||
            "";

          const packageName =
            item.packageType?.toLowerCase() || "";

          return (
            userMatches ||
            billMatches ||
            courseName.includes(searchText) ||
            code.includes(searchText) ||
            packageName.includes(searchText)
          );
        });
      }

      // -------------------------------------
      // NO ITEMS AFTER FILTER
      // -------------------------------------

      if (items.length === 0) {
        continue;
      }

      // -------------------------------------
      // CREATE COMBINED RECORD
      // -------------------------------------

      for (const item of items) {
        result.push({
          order: {
            id: order._id,

            razorpayOrderId:
              order.razorpayOrderId || "",

            razorpayPaymentId:
              order.razorpayPaymentId || "",

            status:
              order.status,

            createdAt:
              order.createdAt,

            updatedAt:
              order.updatedAt,
          },

          user: order.user
            ? {
                id: order.user._id,

                name:
                  order.user.name || "",

                email:
                  order.user.email || "",

                mobile:
                  order.user.mobile || "",

                userType:
                  order.user.userType || "",

                city:
                  order.user.city || "",

                state:
                  order.user.state || "",
              }
            : null,

          course: item.course
            ? {
                id: item.course._id,

                courseCode:
                  item.course.courseCode || "",

                courseName:
                  item.course.courseName || "",
              }
            : null,

          purchase: {
            packageType:
              item.packageType || "",

            // Keep versionName in the response
            // because it may still be useful
            // in the table and Excel report.
            versionName:
              item.versionName || "",

            quantity:
              item.quantity || 1,

            price:
              item.price || 0,

            total:
              item.total || 0,
          },

          bill: order.bill
            ? {
                invoiceNumber:
                  order.bill.invoiceNumber || "",

                orderNumber:
                  order.bill.orderNumber || "",

                billDate:
                  order.bill.billDate || null,

                paymentStatus:
                  order.bill.paymentStatus || "",

                paymentMethod:
                  order.bill.paymentMethod || "",

                transactionId:
                  order.bill.transactionId || "",

                subtotal:
                  order.bill.subtotal || 0,

                tax:
                  order.bill.tax || 0,

                discount:
                  order.bill.discount || 0,

                grandTotal:
                  order.bill.grandTotal || 0,
              }
            : null,

          coupon: order.coupon
            ? {
                id:
                  order.coupon._id,

                code:
                  order.coupon.code || "",

                discount:
                  order.coupon.discount || 0,

                discountType:
                  order.coupon.discountType || "",
              }
            : null,
        });
      }
    }

    // ---------------------------------------
    // 4. RESPONSE
    // ---------------------------------------

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error(
      "Get Combined Data Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCombinedData,
};