const express = require("express");
const router = express.Router();
const authRouter = require("./authRoutes");
const courseRouter = require("./courseRoutes");
const cartRouter = require("./cartRoutes");
const userRouter = require("./userRoutes");
const couponRouter = require("./couponRoutes");
const paymentRouter = require("./paymentRoutes");
const orderRouter = require("./orderRoutes");
const dashboardRouter = require("./dashboardRoutes");

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/course", courseRouter);
router.use("/cart", cartRouter);
router.use("/coupon", couponRouter);
router.use("/payment", paymentRouter);
router.use("/order", orderRouter);
router.use("/dashboard", dashboardRouter);

module.exports = router;
