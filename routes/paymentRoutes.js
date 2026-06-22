const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");

router.post(
  "/create-order",
  authMiddleware,
  createOrder
);

router.post(
  "/verify",
  authMiddleware,
  verifyPayment
);

module.exports = router;