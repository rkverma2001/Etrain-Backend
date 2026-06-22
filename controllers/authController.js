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
      to: [mobile], // Phone number
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
  console.log("========== VERIFY OTP START ==========");
  console.log("REQUEST BODY:", req.body);

  const { mobile, otp } = req.body;

  try {
    if (!mobile || !otp) {
      console.log("ERROR: Mobile or OTP missing");

      return res.status(400).json({
        error: "Phone number and OTP are required",
      });
    }

    console.log("Searching OTP for mobile:", mobile);

    const otpRecord = await Otp.findOne({ mobile });

    console.log("OTP RECORD:", otpRecord);

    if (!otpRecord) {
      console.log("ERROR: OTP Record not found");

      return res.status(404).json({
        error: "OTP not found. Please request a new one.",
      });
    }

    const now = dayjs().tz("Asia/Kolkata");

    console.log("CURRENT TIME:", now.toString());
    console.log("OTP EXPIRY:", otpRecord.expiry);

    if (now.isAfter(otpRecord.expiry)) {
      console.log("ERROR: OTP Expired");

      await Otp.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    console.log("Comparing OTP...");

    const isOtpValid = await bcrypt.compare(
      otp,
      otpRecord.otp
    );

    console.log("OTP VALID:", isOtpValid);

    if (!isOtpValid) {
      console.log("ERROR: Invalid OTP");

      return res.status(400).json({
        error: "Invalid OTP. Please try again.",
      });
    }

    console.log("Searching user...");

    let user = await User.findOne({ mobile });

    console.log("USER FOUND:", user);

    if (!user) {
      console.log("Creating new user...");

      user = new User({
        mobile,
      });

      await user.save();

      console.log("NEW USER CREATED:", user);
    }

    console.log("JWT SECRET EXISTS:", !!process.env.JWT_SECRET);

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    console.log("TOKEN GENERATED");

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    console.log("OTP DELETED");
    console.log("========== VERIFY OTP SUCCESS ==========");

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.log("========== VERIFY OTP ERROR ==========");
    console.log(error);
    console.log(error.message);
    console.log(error.stack);

    return res.status(500).json({
      error: error.message,
    });
  }
};



module.exports = { sendOtp, verifyOtp };
