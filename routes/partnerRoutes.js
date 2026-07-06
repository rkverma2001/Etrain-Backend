const express = require("express");
const router = express.Router();

const { partnerEnquiry } = require("../controllers/partnerController");

router.post("/", partnerEnquiry);

module.exports = router;