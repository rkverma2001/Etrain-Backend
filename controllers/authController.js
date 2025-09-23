const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const springedge = require("springedge");
const Otp = require("../models/otpModel"); // adjust path to your model
const User = require("../models/userModel"); // adjust path to your model
const jwt = require("jsonwebtoken");

dayjs.extend(utc);
dayjs.extend(timezone);

const sendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    // Validate phone number
    if (!mobile) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    let otpRecord = await Otp.findOne({ mobile });

    if (!otpRecord) {
      otpRecord = new Otp({
        mobile,
        otp: hashedOtp,
        expiry: dayjs().tz("Asia/Kolkata").add(5, "minute"),
      });
    } else {
      otpRecord.otp = hashedOtp;
      otpRecord.expiry = dayjs().tz("Asia/Kolkata").add(5, "minute");
    }

    await otpRecord.save();

    const params = {
      sender: "ETREDU", // Sender Name
      apikey: process.env.SPRINGEDGE_API_KEY, // Your API Key
      to: [`+${mobile}`], // Phone number
      message: `Hello Learner! Your OTP for EtrainIndia is ${otp}. This OTP is valid for 5 minutes.`,
      format: "json",
    };

    // Send OTP using SpringEdge
    springedge.messages.send(params, 5000, function (err, response) {
      if (err) {
        return res.status(500).json({ error: "Failed to send OTP" });
      }
      res.status(200).json({ message: `OTP sent successfully` });
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    if (!mobile || !otp) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP are required" });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ mobile });
    if (!otpRecord) {
      return res.status(404).json({ error: "OTP not found. Please request a new one." });
    }

    // Check if OTP is expired
    const now = dayjs().tz("Asia/Kolkata");
    if (now.isAfter(otpRecord.expiry)) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // Compare OTP
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // Check user existence
    let user = await User.findOne({ mobile });

    if (!user) {
      user = new User({
        mobile,
      });
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Cleanup OTP record after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};



module.exports = { sendOtp, verifyOtp };
