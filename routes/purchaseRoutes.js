const express = require("express");
const router = express.Router();

const {
  getCombinedData,
} = require("../controllers/purchaseController");

router.get("/combined", getCombinedData);

module.exports = router;