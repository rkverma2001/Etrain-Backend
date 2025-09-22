const express = require("express");
const router = express.Router();
const authRouter = require("./authRoutes");
const courseRouter = require("./courseRoutes");
const cartRouter = require("./cartRoutes");

router.use("/auth", authRouter);
router.use("/course", courseRouter);
router.use("/cart", cartRouter);


module.exports = router;