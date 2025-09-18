const express = require("express");
const router = express.Router();
const authRouter = require("./authRoutes");
const courseRouter = require("./courseRoutes");

router.use("/auth", authRouter);
router.use("/course", courseRouter);


module.exports = router;