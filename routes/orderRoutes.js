const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, orderController.create);
router.get("/", authMiddleware, orderController.get);

module.exports = router;