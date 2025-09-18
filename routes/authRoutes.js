const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/authController');
const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp); // You need to implement verifyOTP in your controller

module.exports = router;